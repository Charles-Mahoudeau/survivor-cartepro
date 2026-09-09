import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { ROLES } from '@/config/auth/auth.constants';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import { PartnerFixture } from '@/modules/partners/core/specs/partner.fixture';
import { PaymentToken } from '@/modules/payments/core/entities';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import { CaptureMode, PaymentTokenStatus } from '@/modules/payments/core/enums';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { WalletEntryDirection } from '@/modules/wallets/enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '@/modules/wallets/enums/wallet-entry-kind.enum';
import { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { createPaymentToken } from '../../../../../test/fixtures/payment.fixture';
import {
  grantRole,
  signUp,
  type SignedUpAccount,
} from '../../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import type { PaymentTokenResponseDto } from '../../payment-token/validators';
import type { PaymentReceiptResponseDto } from '../validators';

let context: TestApp;
let emailSequence = 0;

const uniqueEmail = (label: string) =>
  `collect-${label}-${++emailSequence}@tickettout.test`;

const collect = (cookie: string[], body: Record<string, unknown>) =>
  api(context.app).post(apiPath('/payments')).set('Cookie', cookie).send(body);

interface Employee {
  account: SignedUpAccount;
  walletId: string;
}

async function createEmployee(balance: number): Promise<Employee> {
  const account = await signUp(context.app, uniqueEmail('employee'));
  const wallet = await createWallet(context.dataSource, account.id, {
    balance,
  });
  return { account, walletId: wallet.id };
}

async function createPartner(
  status: PartnerStatus = PartnerStatus.ACTIVE,
): Promise<{ account: SignedUpAccount; partnerId: string }> {
  const account = await signUp(context.app, uniqueEmail('partner'));
  const partner = await PartnerFixture.create(context.dataSource, account.id, {
    status,
  });
  await grantRole(context, account.id, ROLES.PARTNER);
  return { account, partnerId: partner.id };
}

/** Goes through the employee's own route, so the QR under test is a real one. */
async function issueToken(
  employee: Employee,
): Promise<PaymentTokenResponseDto> {
  return bodyOf<PaymentTokenResponseDto>(
    await api(context.app)
      .post(apiPath('/me/payment-tokens'))
      .set('Cookie', employee.account.cookie)
      .expect(201),
  );
}

const readWallet = (walletId: string) =>
  context.dataSource.getRepository(Wallet).findOneByOrFail({ id: walletId });

const readPayments = () =>
  context.dataSource
    .getRepository(Payment)
    .find({ relations: { partner: true, wallet: true } });

const readEntries = (walletId: string) =>
  context.dataSource.getRepository(WalletEntry).find({
    where: { wallet: { id: walletId } },
    relations: { payment: true },
  });

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('POST /payments — collecting from a scan', () => {
  it('debits the wallet, writes the movement and spends the token, all at once', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 12.5,
      partnerReference: 'TICKET-42',
    }).expect(201);

    const receipt = bodyOf<PaymentReceiptResponseDto>(response);
    expect(receipt.amount).toBe('12.50');
    expect(receipt.partnerReference).toBe('TICKET-42');

    const payments = await readPayments();
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({
      id: receipt.paymentId,
      amount: '12.50',
      captureMode: CaptureMode.QR_CODE,
      partnerReference: 'TICKET-42',
    });
    expect(payments[0].partner.id).toBe(partner.partnerId);
    expect(payments[0].wallet.id).toBe(employee.walletId);

    await expect(readWallet(employee.walletId)).resolves.toMatchObject({
      balance: '37.50',
    });

    const entries = await readEntries(employee.walletId);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      direction: WalletEntryDirection.DEBIT,
      kind: WalletEntryKind.PAYMENT_SENT,
      amount: '12.50',
      balanceAfter: '37.50',
    });
    expect(entries[0].payment?.id).toBe(receipt.paymentId);

    await expect(
      context.dataSource
        .getRepository(PaymentToken)
        .findOneByOrFail({ id: token.token }),
    ).resolves.toMatchObject({ status: PaymentTokenStatus.CONSUMED });
  });

  it('never discloses the wallet balance to the till', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 12.5,
    }).expect(201);

    expect(Object.keys(bodyOf(response))).toEqual([
      'paymentId',
      'amount',
      'partnerReference',
      'createdAt',
    ]);
  });

  it('pays the partner behind the session, not one the body names', async () => {
    const employee = await createEmployee(50);
    const collecting = await createPartner();
    const other = await createPartner();
    const token = await issueToken(employee);

    await collect(collecting.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 10,
      partnerId: other.partnerId,
    }).expect(201);

    const payments = await readPayments();
    expect(payments[0].partner.id).toBe(collecting.partnerId);
  });
});

describe('POST /payments — collecting from a typed code', () => {
  it('accepts the code in lower case and records a manual capture', async () => {
    const employee = await createEmployee(20);
    const partner = await createPartner();
    const token = await issueToken(employee);

    await collect(partner.account.cookie, {
      shortCode: token.shortCode.toLowerCase(),
      amount: 5,
    }).expect(201);

    const payments = await readPayments();
    expect(payments[0]).toMatchObject({
      captureMode: CaptureMode.MANUAL_CODE,
      amount: '5.00',
    });
  });

  it('refuses a code no live token carries', async () => {
    const partner = await createPartner();

    const response = await collect(partner.account.cookie, {
      shortCode: 'ZZZZZZZZ',
      amount: 5,
    });

    expect(response.status).toBe(400);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.PAYMENT_TOKEN_INVALID }),
    );
  });

  it('refuses a token whose window has passed', async () => {
    const employee = await createEmployee(20);
    const partner = await createPartner();
    const token = await createPaymentToken(
      context.dataSource,
      employee.walletId,
      { expiresAt: new Date(Date.now() - 1000) },
    );

    const response = await collect(partner.account.cookie, {
      shortCode: token.shortCode,
      amount: 5,
    });

    expect(response.status).toBe(410);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.PAYMENT_TOKEN_EXPIRED }),
    );
    await expect(readWallet(employee.walletId)).resolves.toMatchObject({
      balance: '20.00',
    });
  });
});

describe('POST /payments — a token pays once', () => {
  it('hands a till repeating its own request the payment it already made', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);
    const body = { qrPayload: token.qrPayload, amount: 12.5 };

    const first = await collect(partner.account.cookie, body).expect(201);
    const repeat = await collect(partner.account.cookie, body).expect(201);

    expect(bodyOf<PaymentReceiptResponseDto>(repeat).paymentId).toBe(
      bodyOf<PaymentReceiptResponseDto>(first).paymentId,
    );
    expect(await readPayments()).toHaveLength(1);
    expect(await readEntries(employee.walletId)).toHaveLength(1);
    await expect(readWallet(employee.walletId)).resolves.toMatchObject({
      balance: '37.50',
    });
  });

  it('refuses a till claiming a token another amount already spent', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);

    await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 12.5,
    }).expect(201);
    const other = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 20,
    });

    expect(other.status).toBe(409);
    expect(bodyOf(other)).toEqual(
      expect.objectContaining({
        message: ERROR_CODES.PAYMENT_TOKEN_ALREADY_USED,
      }),
    );
    expect(await readPayments()).toHaveLength(1);
    await expect(readWallet(employee.walletId)).resolves.toMatchObject({
      balance: '37.50',
    });
  });

  it('debits once when the same till submits twice at the same moment', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);
    const body = { qrPayload: token.qrPayload, amount: 12.5 };

    const responses = await Promise.all([
      collect(partner.account.cookie, body),
      collect(partner.account.cookie, body),
    ]);

    const payments = await readPayments();
    expect(payments).toHaveLength(1);
    expect(await readEntries(employee.walletId)).toHaveLength(1);
    await expect(readWallet(employee.walletId)).resolves.toMatchObject({
      balance: '37.50',
    });
    for (const response of responses) {
      if (response.status === 201) {
        expect(bodyOf<PaymentReceiptResponseDto>(response).paymentId).toBe(
          payments[0].id,
        );
      }
    }
  });

  it('never hands one till the payment another till collected', async () => {
    const employee = await createEmployee(50);
    const first = await createPartner();
    const second = await createPartner();
    const token = await issueToken(employee);

    const responses = await Promise.all([
      collect(first.account.cookie, { qrPayload: token.qrPayload, amount: 10 }),
      collect(second.account.cookie, {
        qrPayload: token.qrPayload,
        amount: 10,
      }),
    ]);

    const payments = await readPayments();
    expect(payments).toHaveLength(1);
    expect(await readEntries(employee.walletId)).toHaveLength(1);

    const paid = payments[0].partner.id;
    const [firstResponse, secondResponse] = responses;
    const loser = paid === first.partnerId ? secondResponse : firstResponse;
    expect(loser.status).not.toBe(201);
    expect(JSON.stringify(bodyOf(loser))).not.toContain(payments[0].id);
  });
});

describe('POST /payments — refusals leave nothing behind', () => {
  it('refuses a debit the balance cannot absorb, and keeps the token live', async () => {
    const employee = await createEmployee(5);
    const partner = await createPartner();
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 500,
    });

    expect(response.status).toBe(422);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.INSUFFICIENT_BALANCE }),
    );
    expect(await readPayments()).toHaveLength(0);
    expect(await readEntries(employee.walletId)).toHaveLength(0);
    await expect(readWallet(employee.walletId)).resolves.toMatchObject({
      balance: '5.00',
    });
    await expect(
      context.dataSource
        .getRepository(PaymentToken)
        .findOneByOrFail({ id: token.token }),
    ).resolves.toMatchObject({ status: PaymentTokenStatus.LIVE });
  });

  it('refuses a suspended wallet holding a token issued before the suspension', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);
    await context.dataSource
      .getRepository(Wallet)
      .update({ id: employee.walletId }, { status: WalletStatus.DISABLED });

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 10,
    });

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.ACCOUNT_BANNED }),
    );
    expect(await readPayments()).toHaveLength(0);
    await expect(readWallet(employee.walletId)).resolves.toMatchObject({
      balance: '50.00',
    });
  });

  it('refuses a partner whose dossier is not approved yet', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner(PartnerStatus.PENDING);
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 10,
    });

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.PARTNER_NOT_ACTIVE }),
    );
    expect(await readPayments()).toHaveLength(0);
  });

  it('refuses a payload whose signature does not match its claims', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);
    const [body, signature] = token.qrPayload.split('.');
    const tampered = `${body}.${signature.slice(0, -1)}${signature.endsWith('A') ? 'B' : 'A'}`;

    const response = await collect(partner.account.cookie, {
      qrPayload: tampered,
      amount: 10,
    });

    expect(response.status).toBe(400);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.PAYMENT_TOKEN_INVALID }),
    );
    expect(await readPayments()).toHaveLength(0);
  });
});

describe('POST /payments — request shape', () => {
  it('refuses a request carrying no credential', async () => {
    const partner = await createPartner();

    const response = await collect(partner.account.cookie, { amount: 10 });

    expect(response.status).toBe(400);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({
        message: ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID,
      }),
    );
  });

  it('refuses a request carrying both credentials', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      shortCode: token.shortCode,
      amount: 10,
    });

    expect(response.status).toBe(400);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({
        message: ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID,
      }),
    );
    expect(await readPayments()).toHaveLength(0);
  });

  it('refuses an amount with more precision than a cent', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 10.005,
    });

    expect(response.status).toBe(400);
    expect(await readPayments()).toHaveLength(0);
  });

  it('refuses an amount of zero', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 0,
    });

    expect(response.status).toBe(400);
    expect(await readPayments()).toHaveLength(0);
  });

  it('refuses a blank till reference the column would reject', async () => {
    const employee = await createEmployee(50);
    const partner = await createPartner();
    const token = await issueToken(employee);

    const response = await collect(partner.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 10,
      partnerReference: '   ',
    });

    expect(response.status).toBe(400);
    expect(await readPayments()).toHaveLength(0);
  });
});

describe('POST /payments — who may call it', () => {
  it('rejects an unauthenticated collection', async () => {
    const response = await api(context.app)
      .post(apiPath('/payments'))
      .send({ shortCode: 'ABCDEFGH', amount: 10 });

    expect(response.status).toBe(401);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.UNAUTHENTICATED }),
    );
  });

  it('rejects an employee collecting from another employee', async () => {
    const employee = await createEmployee(50);
    const payer = await createEmployee(50);
    const token = await issueToken(payer);

    const response = await collect(employee.account.cookie, {
      qrPayload: token.qrPayload,
      amount: 10,
    });

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.FORBIDDEN_ROLE }),
    );
    expect(await readPayments()).toHaveLength(0);
  });
});
