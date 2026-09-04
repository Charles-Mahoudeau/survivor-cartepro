import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { ROLES } from '@/config/auth/auth.constants';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { grantRole, signUp } from '../../../../../test/fixtures/user.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';

let context: TestApp;

const expectedPaymentToken = {
  token: 'demo-payment-token',
  qrPayload: 'demo-payment-token',
  shortCode: 'CPR4F7X2',
  expiresAt: '2026-09-04T02:02:00.000Z',
};

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('payment token endpoints', () => {
  it('emits the static QR payload for an employee', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-employee@tickettout.test',
    );

    const response = await api(context.app)
      .post(apiPath('/me/payment-tokens'))
      .set('Cookie', employee.cookie)
      .expect(201);

    expect(bodyOf(response)).toEqual(expectedPaymentToken);
  });

  it('returns the same static QR payload for the current token', async () => {
    const employee = await signUp(
      context.app,
      'payment-token-current@tickettout.test',
    );

    const response = await api(context.app)
      .get(apiPath('/me/payment-tokens/current'))
      .set('Cookie', employee.cookie)
      .expect(200);

    expect(bodyOf(response)).toEqual(expectedPaymentToken);
  });

  it('rejects an unauthenticated token creation request', async () => {
    const response = await api(context.app).post(apiPath('/me/payment-tokens'));

    expect(response.status).toBe(401);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.UNAUTHENTICATED }),
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

  it('rejects a non-employee token creation request', async () => {
    const account = await signUp(
      context.app,
      'payment-token-partner-create@tickettout.test',
    );
    await grantRole(context, account.id, ROLES.PARTNER);

    const response = await api(context.app)
      .post(apiPath('/me/payment-tokens'))
      .set('Cookie', account.cookie);

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.FORBIDDEN_ROLE }),
    );
  });

  it('rejects a non-employee current-token request', async () => {
    const account = await signUp(
      context.app,
      'payment-token-partner-current@tickettout.test',
    );
    await grantRole(context, account.id, ROLES.PARTNER);

    const response = await api(context.app)
      .get(apiPath('/me/payment-tokens/current'))
      .set('Cookie', account.cookie);

    expect(response.status).toBe(403);
    expect(bodyOf(response)).toEqual(
      expect.objectContaining({ message: ERROR_CODES.FORBIDDEN_ROLE }),
    );
  });
});
