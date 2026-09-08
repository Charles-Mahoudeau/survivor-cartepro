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

const NO_ACTOR = { actorId: null, actorRole: null, payload: null, ip: null };

describe('audit chain — genesis', () => {
  it('writes one origin entry when the log is empty', async () => {
    const auditService = context.app.get(AuditService);

    await auditService.ensureChainOrigin();

    const chain = await readChain();
    expect(chain).toHaveLength(1);
    expect(chain[0]).toMatchObject({
      action: AuditAction.ADMIN_ACTION,
      targetType: 'audit_chain',
      targetId: null,
      previousHash: null,
    });
    expect(verifyChain(chain).ok).toBe(true);
  });

  it('never writes a second origin entry once the log already has one', async () => {
    const auditService = context.app.get(AuditService);

    await auditService.ensureChainOrigin();
    await auditService.ensureChainOrigin();
    await auditService.ensureChainOrigin();

    expect(await readChain()).toHaveLength(1);
  });

  it('does not run once the log already holds a real entry', async () => {
    const auditService = context.app.get(AuditService);
    await auditService.record({
      action: AuditAction.PARTNER_APPROVED,
      targetType: 'partner',
      targetId: 'p-1',
      ...NO_ACTOR,
    });

    await auditService.ensureChainOrigin();

    const chain = await readChain();
    expect(chain).toHaveLength(1);
    expect(chain[0].targetType).toBe('partner');
  });
});

describe('audit chain — record', () => {
  it('links successive entries and the chain verifies intact', async () => {
    const auditService = context.app.get(AuditService);

    await auditService.record({
      action: AuditAction.PARTNER_APPROVED,
      targetType: 'partner',
      targetId: 'p-1',
      ...NO_ACTOR,
    });
    await auditService.record({
      action: AuditAction.PARTNER_REFUSED,
      targetType: 'partner',
      targetId: 'p-2',
      ...NO_ACTOR,
    });
    await auditService.record({
      action: AuditAction.ALLOCATION_APPLIED,
      targetType: 'allocation',
      targetId: 'a-1',
      ...NO_ACTOR,
    });

    const chain = await readChain();
    expect(chain).toHaveLength(3);
    expect(chain[0].previousHash).toBeNull();
    expect(chain[1].previousHash).toBe(chain[0].hash);
    expect(chain[2].previousHash).toBe(chain[1].hash);
    expect(verifyChain(chain)).toEqual({
      ok: true,
      checked: 3,
      anomalies: [],
    });
  });

  it('serializes concurrent records into one line instead of forking it', async () => {
    const auditService = context.app.get(AuditService);
    const entry = (targetId: string) => ({
      action: AuditAction.ADMIN_ACTION,
      targetType: 'employer',
      targetId,
      ...NO_ACTOR,
    });

    await Promise.all([
      auditService.record(entry('e-1')),
      auditService.record(entry('e-2')),
      auditService.record(entry('e-3')),
      auditService.record(entry('e-4')),
      auditService.record(entry('e-5')),
    ]);

    const chain = await readChain();
    expect(chain).toHaveLength(5);
    expect(verifyChain(chain)).toEqual({
      ok: true,
      checked: 5,
      anomalies: [],
    });
  });

  it('never throws when the write is rejected, so it cannot block the operation it records', async () => {
    const auditService = context.app.get(AuditService);

    await expect(
      auditService.record({
        // Not a value the "audit_log_action_enum" column accepts.
        action: 'not_a_real_action' as AuditAction,
        targetType: 'partner',
        targetId: 'p-1',
        ...NO_ACTOR,
      }),
    ).resolves.toBeUndefined();

    expect(await readChain()).toHaveLength(0);
  });
});
