import { Client } from 'pg';
import { Audit } from '@/modules/audit/entities';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { AuditService } from '@/modules/audit/services';
import {
  verifyChain,
  type ChainEntry,
} from '@/modules/audit/services/helpers/chain-verifier.helper';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from './app';

let context: TestApp;

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

async function readChain(): Promise<ChainEntry[]> {
  const rows = await context.dataSource
    .getRepository(Audit)
    .find({ order: { id: 'ASC' } });

  return rows.map((row) => ({
    id: row.id,
    actorId: row.actorId,
    actorRole: row.actorRole,
    action: row.action,
    targetType: row.targetType,
    targetId: row.targetId,
    payload: row.payload,
    ip: row.ip,
    previousHash: row.previousHash,
    hash: row.hash,
  }));
}

async function seedThreeEntries(): Promise<void> {
  const auditService = context.app.get(AuditService);
  const noActor = { actorId: null, actorRole: null, payload: null, ip: null };

  await auditService.record({
    action: AuditAction.PARTNER_APPROVED,
    targetType: 'partner',
    targetId: 'p-1',
    ...noActor,
  });
  await auditService.record({
    action: AuditAction.ALLOCATION_APPLIED,
    targetType: 'allocation',
    targetId: 'a-1',
    ...noActor,
  });
  await auditService.record({
    action: AuditAction.PARTNER_REFUSED,
    targetType: 'partner',
    targetId: 'p-2',
    ...noActor,
  });
}

/**
 * The role the migration's `REVOKE` names is the same one the ephemeral test
 * container bootstraps as *its* superuser (`PostgreSqlContainer` runs initdb
 * with that username), which bypasses every ACL check unconditionally and
 * would make the REVOKE look like it holds even if it were absent from the
 * migration entirely.
 *
 * This role has no such exemption: it inherits the application role's own
 * grants — the same `SELECT`/`INSERT` the REVOKE left untouched — through
 * plain membership, without ever touching the application role's superuser
 * bit (which nothing in this container could restore afterward, since it is
 * the only superuser that exists here).
 */
const PROBE_ROLE = 'audit_log_probe_test_role';
const PROBE_PASSWORD = 'audit-log-probe-password';

async function connectAsProbe(): Promise<Client> {
  const options = context.dataSource.options as {
    host: string;
    port: number;
    database: string;
  };
  const client = new Client({
    host: options.host,
    port: options.port,
    database: options.database,
    user: PROBE_ROLE,
    password: PROBE_PASSWORD,
  });
  await client.connect();
  return client;
}

describe('audit_log REVOKE — the application role cannot tamper', () => {
  let probe: Client;

  beforeAll(async () => {
    const applicationUser = (context.dataSource.options as { username: string })
      .username;
    await context.dataSource.query(`DROP ROLE IF EXISTS "${PROBE_ROLE}"`);
    await context.dataSource.query(
      `CREATE ROLE "${PROBE_ROLE}" LOGIN PASSWORD '${PROBE_PASSWORD}'`,
    );
    await context.dataSource.query(
      `GRANT "${applicationUser}" TO "${PROBE_ROLE}"`,
    );
    probe = await connectAsProbe();
  });

  afterAll(async () => {
    await probe.end();
    await context.dataSource.query(`DROP ROLE IF EXISTS "${PROBE_ROLE}"`);
  });

  it('rejects an UPDATE on an existing row', async () => {
    await seedThreeEntries();
    const [row] = await readChain();

    await expect(
      probe.query('UPDATE "audit_log" SET "target_id" = $1 WHERE "id" = $2', [
        'forged',
        row.id,
      ]),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('rejects a DELETE on an existing row', async () => {
    await seedThreeEntries();
    const [row] = await readChain();

    await expect(
      probe.query('DELETE FROM "audit_log" WHERE "id" = $1', [row.id]),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('rejects a TRUNCATE of the whole table', async () => {
    await seedThreeEntries();

    await expect(
      probe.query('TRUNCATE TABLE "audit_log"'),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('still allows the writes the interceptor itself needs', async () => {
    await expect(
      probe.query(
        `INSERT INTO "audit_log"
           ("id", "action", "target_type", "target_id", "payload", "ip", "previous_hash", "hash")
         VALUES (uuidv7(), 'admin_action', 'probe', NULL, NULL, NULL, NULL, 'x')`,
      ),
    ).resolves.toBeDefined();
    await expect(
      probe.query('SELECT * FROM "audit_log"'),
    ).resolves.toBeDefined();
  });
});

describe('tamper detection via the hash chain', () => {
  it('names the exact row a privileged operator edited in place', async () => {
    await seedThreeEntries();
    const before = await readChain();
    expect(verifyChain(before).ok).toBe(true);

    const tamperedRow = before[1];
    await context.dataSource.query(
      'UPDATE "audit_log" SET "target_id" = $1 WHERE "id" = $2',
      ['forged-target', tamperedRow.id],
    );

    const after = await readChain();
    const result = verifyChain(after);

    expect(result.ok).toBe(false);
    expect(result.anomalies).toEqual([
      { type: 'tampered', id: tamperedRow.id, index: 1 },
    ]);
  });

  it('detects a suppressed row through a distinct signature, not tampering', async () => {
    await seedThreeEntries();
    const before = await readChain();
    expect(verifyChain(before).ok).toBe(true);

    const deletedRow = before[1];
    await context.dataSource.query('DELETE FROM "audit_log" WHERE "id" = $1', [
      deletedRow.id,
    ]);

    const after = await readChain();
    const result = verifyChain(after);

    expect(result.ok).toBe(false);
    expect(result.anomalies).toEqual([
      { type: 'missing_link', id: before[2].id, index: 1 },
    ]);
  });
});
