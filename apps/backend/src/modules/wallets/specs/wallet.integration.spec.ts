import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import { grantRole, signUp } from '../../../../test/fixtures/user.fixture';
import {
  createWallet,
  createWalletEntry,
} from '../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../test/http';
import { ROLES } from '../../../config/auth/auth.constants';
import { WalletStatus } from '../enums/wallet-status.enum';

let context: TestApp;
const getMyWallet = (cookie: string[]) =>
  api(context.app).get(apiPath('/me/wallet')).set('Cookie', cookie);

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('GET /me/wallet', () => {
  it('returns the wallet of the connected employee', async () => {
    const account = await signUp(context.app, 'salarie@tickettout.test');
    await createWallet(context.dataSource, account.id, { balance: 42.5 });

    const response = await getMyWallet(account.cookie).expect(200);

    expect(
      bodyOf<{ balance: string; currency: string; status: string }>(response),
    ).toEqual({
      balance: '42.50',
      currency: 'EUR',
      status: WalletStatus.ACTIVE,
      lastMovement: null,
    });
  });

  it('answers 200 with the status when the wallet is disabled', async () => {
    const account = await signUp(context.app, 'suspendu@tickettout.test');
    await createWallet(context.dataSource, account.id, {
      status: WalletStatus.DISABLED,
    });

    const response = await getMyWallet(account.cookie).expect(200);

    expect(bodyOf<{ status: string }>(response).status).toBe(
      WalletStatus.DISABLED,
    );
  });

  it('carries the most recent entry as the last movement', async () => {
    const account = await signUp(context.app, 'mouvement@tickettout.test');
    const wallet = await createWallet(context.dataSource, account.id);
    await createWalletEntry(context.dataSource, wallet.id, {
      amount: 10,
      balanceAfter: 10,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });
    await createWalletEntry(context.dataSource, wallet.id, {
      amount: 5,
      balanceAfter: 15,
      createdAt: new Date('2026-01-02T00:00:00Z'),
    });

    const response = await getMyWallet(account.cookie).expect(200);

    expect(
      bodyOf<{ lastMovement: { amount: string } }>(response).lastMovement,
    ).toMatchObject({ amount: '5.00' });
  });

  it('answers 404 when the connected account has no wallet', async () => {
    const account = await signUp(
      context.app,
      'sansportefeuille@tickettout.test',
    );

    const response = await getMyWallet(account.cookie).expect(404);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'WALLET_NOT_FOUND',
    );
  });

  it('refuses a partner', async () => {
    const account = await signUp(context.app, 'partenaire@tickettout.test');
    await grantRole(context, account.id, ROLES.PARTNER);
    await createWallet(context.dataSource, account.id);

    const response = await getMyWallet(account.cookie).expect(403);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('refuses a request with no session', async () => {
    await api(context.app).get(apiPath('/me/wallet')).expect(401);
  });
});
