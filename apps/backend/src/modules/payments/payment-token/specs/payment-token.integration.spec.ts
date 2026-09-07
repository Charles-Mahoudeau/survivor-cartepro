import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { ROLES } from '@/config/auth/auth.constants';
import { PaymentToken } from '@/modules/payments/core/entities';
import { PaymentTokenStatus } from '@/modules/payments/core/enums';
import { WalletStatus } from '@/modules/wallets/enums';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { grantRole, signUp } from '../../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import { MAX_PAYMENT_TOKEN_TTL_SECONDS } from '../constants/payment-token.constants';
import { verifyPaymentToken } from '../services/helpers/payment-token-signer.helper';

let context: TestApp;

const PAYMENT_TOKEN_SIGNING_SECRET = process.env
  .PAYMENT_TOKEN_SIGNING_SECRET as string;

interface PaymentTokenResponse {
  token: string;
  qrPayload: string;
  shortCode: string;
  expiresAt: string;
}

const issueToken = (cookie: string[]) =>
  api(context.app).post(apiPath('/me/payment-tokens')).set('Cookie', cookie);
const getCurrentToken = (cookie: string[]) =>
  api(context.app)
    .get(apiPath('/me/payment-tokens/current'))
    .set('Cookie', cookie);

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('POST /me/payment-tokens', () => {
  it('issues a signed token for a spendable wallet', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-issue@tickettout.test',
    );
    const wallet = await createWallet(context.dataSource, employee.id, {
      balance: 42.5,
    });

    const response = await issueToken(employee.cookie).expect(201);
    const body = bodyOf<PaymentTokenResponse>(response);

    expect(body.shortCode).toMatch(/^[A-Z0-9]{8}$/);
    const expiresInSeconds =
      (new Date(body.expiresAt).getTime() - Date.now()) / 1000;
    expect(expiresInSeconds).toBeGreaterThan(0);
    expect(expiresInSeconds).toBeLessThanOrEqual(MAX_PAYMENT_TOKEN_TTL_SECONDS);

    const claims = verifyPaymentToken(
      body.qrPayload,
      PAYMENT_TOKEN_SIGNING_SECRET,
    );
    expect(claims).toMatchObject({
      userId: employee.id,
      walletId: wallet.id,
      expiresAt: body.expiresAt,
    });

    const persisted = await context.dataSource
      .getRepository(PaymentToken)
      .findOneBy({ id: body.token });
    expect(persisted).toMatchObject({
      shortCode: body.shortCode,
      status: PaymentTokenStatus.LIVE,
    });
  });

  it('revokes the previous live token when issuing a new one', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-revoke@tickettout.test',
    );
    await createWallet(context.dataSource, employee.id, { balance: 10 });

    const first = bodyOf<PaymentTokenResponse>(
      await issueToken(employee.cookie).expect(201),
    );
    const second = bodyOf<PaymentTokenResponse>(
      await issueToken(employee.cookie).expect(201),
    );

    const paymentTokenRepo = context.dataSource.getRepository(PaymentToken);
    await expect(
      paymentTokenRepo.findOneBy({ id: first.token }),
    ).resolves.toMatchObject({ status: PaymentTokenStatus.REVOKED });
    await expect(
      paymentTokenRepo.findOneBy({ id: second.token }),
    ).resolves.toMatchObject({ status: PaymentTokenStatus.LIVE });
  });

  it('refuses when the wallet balance is zero or negative', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-empty-balance@tickettout.test',
    );
    await createWallet(context.dataSource, employee.id, { balance: 0 });

    const response = await issueToken(employee.cookie);

    expect(response.status).toBe(422);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.EMPTY_BALANCE }),
    );
  });

  it('refuses when the wallet is disabled', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-disabled-wallet@tickettout.test',
    );
    await createWallet(context.dataSource, employee.id, {
      balance: 10,
      status: WalletStatus.DISABLED,
    });

    const response = await issueToken(employee.cookie);

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.ACCOUNT_BANNED }),
    );
  });

  it('answers 404 when the connected account has no wallet', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-no-wallet@tickettout.test',
    );

    const response = await issueToken(employee.cookie);

    expect(response.status).toBe(404);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.WALLET_NOT_FOUND }),
    );
  });

  it('rejects an unauthenticated token creation request', async () => {
    const response = await api(context.app).post(apiPath('/me/payment-tokens'));

    expect(response.status).toBe(401);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.UNAUTHENTICATED }),
    );
  });

  it('rejects a non-employee token creation request', async () => {
    const account = await signUp(
      context.app,
      'payment-token-partner-create@tickettout.test',
    );
    await grantRole(context, account.id, ROLES.PARTNER);

    const response = await issueToken(account.cookie);

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.FORBIDDEN_ROLE }),
    );
  });
});

describe('GET /me/payment-tokens/current', () => {
  it('returns the live token after one has been issued', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-current@tickettout.test',
    );
    await createWallet(context.dataSource, employee.id, { balance: 10 });
    const issued = bodyOf<PaymentTokenResponse>(
      await issueToken(employee.cookie).expect(201),
    );

    const response = await getCurrentToken(employee.cookie).expect(200);

    expect(bodyOf(response)).toEqual(issued);
  });

  it('answers 404 when the wallet has no live token yet', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-current-none@tickettout.test',
    );
    await createWallet(context.dataSource, employee.id, { balance: 10 });

    const response = await getCurrentToken(employee.cookie);

    expect(response.status).toBe(404);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({
        message: ERROR_CODES.PAYMENT_TOKEN_NOT_FOUND,
      }),
    );
  });

  it('answers 404 when the connected account has no wallet', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-current-no-wallet@tickettout.test',
    );

    const response = await getCurrentToken(employee.cookie);

    expect(response.status).toBe(404);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.WALLET_NOT_FOUND }),
    );
  });

  it('rejects an unauthenticated current-token request', async () => {
    const response = await api(context.app).get(
      apiPath('/me/payment-tokens/current'),
    );

    expect(response.status).toBe(401);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.UNAUTHENTICATED }),
    );
  });

  it('rejects a non-employee current-token request', async () => {
    const account = await signUp(
      context.app,
      'payment-token-partner-current@tickettout.test',
    );
    await grantRole(context, account.id, ROLES.PARTNER);

    const response = await getCurrentToken(account.cookie);

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.FORBIDDEN_ROLE }),
    );
  });
});
