import type { Client } from 'pg';
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
import { connectAsAdmin } from './db/admin-connection';

let context: TestApp;

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
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
 * `context.dataSource` is the same restricted, non-superuser role the
 * running application connects as in dev and prod (see
 * `ensure-application-role.ts`) — the REVOKE the migration applies binds to
 * exactly this connection, so these assertions run against it directly.
 * No second role invented just to prove this.
 */
describe('audit_log REVOKE — the application role cannot tamper', () => {
  it('rejects an UPDATE on an existing row', async () => {
    await seedThreeEntries();
    const [row] = await readChain();

    await expect(
      context.dataSource.query(
        'UPDATE "audit_log" SET "target_id" = $1 WHERE "id" = $2',
        ['forged', row.id],
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('rejects a DELETE on an existing row', async () => {
    await seedThreeEntries();
    const [row] = await readChain();

    await expect(
      context.dataSource.query('DELETE FROM "audit_log" WHERE "id" = $1', [
        row.id,
      ]),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('rejects a TRUNCATE of the whole table', async () => {
    await seedThreeEntries();

    await expect(
      context.dataSource.query('TRUNCATE TABLE "audit_log"'),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('still allows the writes the interceptor itself needs', async () => {
    await seedThreeEntries();

    await expect(
      context.dataSource.query('SELECT * FROM "audit_log"'),
    ).resolves.toBeDefined();
    // INSERT is exercised by every other spec via AuditService.record —
    // seedThreeEntries above already proved it works through this exact
    // connection.
  });
});

/**
 * Simulates the letter's demo script: "connecting as a privileged
 * operator" — a genuinely separate, privileged connection, since
 * `context.dataSource` can no longer perform the tampering it used to
 * stand in for.
 */
describe('tamper detection via the hash chain', () => {
  let admin: Client;

  beforeAll(async () => {
    admin = await connectAsAdmin();
  });

  afterAll(async () => {
    await admin.end();
  });

  it('names the exact row a privileged operator edited in place', async () => {
    await seedThreeEntries();
    const before = await readChain();
    expect(verifyChain(before).ok).toBe(true);

    const tamperedRow = before[1];
    await admin.query(
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
    await admin.query('DELETE FROM "audit_log" WHERE "id" = $1', [
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
