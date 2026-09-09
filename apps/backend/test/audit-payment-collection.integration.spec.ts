import { Audit } from '@/modules/audit/entities';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { CollectPaymentFixture } from '@/modules/payments/collect/specs/collect-payment.fixture';
import type { PaymentReceiptResponseDto } from '@/modules/payments/collect/validators';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from './app';
import { api, apiPath, bodyOf } from './http';

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

const collect = (cookie: string[], body: Record<string, unknown>) =>
  api(context.app).post(apiPath('/payments')).set('Cookie', cookie).send(body);

/**
 * The interceptor fires the write without awaiting it, so the response can
 * come back before the row lands.
 */
async function waitForAction(
  action: AuditAction,
  timeoutMs = 2000,
): Promise<Audit> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const row = await context.dataSource
      .getRepository(Audit)
      .findOne({ where: { action } });
    if (row) {
      return row;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`no audit_log row appeared for ${action} in time`);
}

const readByAction = (action: AuditAction) =>
  context.dataSource.getRepository(Audit).find({ where: { action } });

describe('auditing a collection', () => {
  it('records an approved transaction against the payment it created', async () => {
    const employee = await CollectPaymentFixture.signUpEmployee(context, 50);
    const partner = await CollectPaymentFixture.signUpPartner(context);
    const token = await CollectPaymentFixture.issueToken(context, employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 12.5,
    }).expect(201);

    const receipt = bodyOf<PaymentReceiptResponseDto>(response);
    const entry = await waitForAction(AuditAction.TRANSACTION_APPROVED);

    expect(entry.targetType).toBe('payment');
    expect(entry.targetId).toBe(receipt.paymentId);
    expect(entry.actorRole).toBe('partner');
    expect(entry.actorId).toBe(partner.account.id);
  });

  it('records a refused transaction when the balance cannot cover it', async () => {
    const employee = await CollectPaymentFixture.signUpEmployee(context, 5);
    const partner = await CollectPaymentFixture.signUpPartner(context);
    const token = await CollectPaymentFixture.issueToken(context, employee);

    await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 40,
    }).expect(422);

    const entry = await waitForAction(AuditAction.TRANSACTION_REFUSED);

    expect(entry.actorRole).toBe('partner');
    expect(entry.targetId).toBeNull();
    expect(await readByAction(AuditAction.TRANSACTION_APPROVED)).toHaveLength(
      0,
    );
  });

  it('never writes the QR payload of a refused collection, which stays spendable', async () => {
    const employee = await CollectPaymentFixture.signUpEmployee(context, 5);
    const partner = await CollectPaymentFixture.signUpPartner(context);
    const token = await CollectPaymentFixture.issueToken(context, employee);

    await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 40,
    }).expect(422);

    const entry = await waitForAction(AuditAction.TRANSACTION_REFUSED);
    const serialized = JSON.stringify(entry);

    expect(serialized).not.toContain(token.qrPayload);
    expect(serialized).not.toContain(token.shortCode);
  });

  it('keeps the amount, which is what the entry exists to prove', async () => {
    const employee = await CollectPaymentFixture.signUpEmployee(context, 50);
    const partner = await CollectPaymentFixture.signUpPartner(context);
    const token = await CollectPaymentFixture.issueToken(context, employee);

    await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 12.5,
      partnerReference: 'TICKET-42',
    }).expect(201);

    const entry = await waitForAction(AuditAction.TRANSACTION_APPROVED);

    expect(entry.payload).toMatchObject({
      amount: 12.5,
      partnerReference: 'TICKET-42',
    });
  });

  it('writes nothing when no route asked for it', async () => {
    const employee = await CollectPaymentFixture.signUpEmployee(context, 50);
    await CollectPaymentFixture.issueToken(context, employee);

    expect(await readByAction(AuditAction.TRANSACTION_APPROVED)).toHaveLength(
      0,
    );
    expect(await readByAction(AuditAction.TRANSACTION_REFUSED)).toHaveLength(0);
  });
});
