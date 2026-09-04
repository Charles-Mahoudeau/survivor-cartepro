import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import { createAllocation } from '../../../../test/fixtures/allocation.fixture';
import { createEmployer } from '../../../../test/fixtures/employer.fixture';
import { createPayment } from '../../../../test/fixtures/payment.fixture';
import { grantRole, signUp } from '../../../../test/fixtures/user.fixture';
import {
  createWallet,
  createWalletEntry,
} from '../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../test/http';
import { ROLES } from '../../../config/auth/auth.constants';
import { PartnerFixture } from '../../partners/core/specs/partner.fixture';
import { WalletEntryDirection } from '../enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '../enums/wallet-entry-kind.enum';
import { WalletStatus } from '../enums/wallet-status.enum';

let context: TestApp;
const getMyWallet = (cookie: string[]) =>
  api(context.app).get(apiPath('/me/wallet')).set('Cookie', cookie);
const listMyWalletEntries = (cookie: string[], qs = '') =>
  api(context.app)
    .get(apiPath(`/me/wallet/entries${qs}`))
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

describe('GET /me/wallet/entries', () => {
  it('carries the partner name on a debit', async () => {
    const account = await signUp(context.app, 'debit@tickettout.test');
    const wallet = await createWallet(context.dataSource, account.id);
    const owner = await signUp(
      context.app,
      'debit-partner-owner@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      tradeName: 'Le Bistrot',
    });
    const payment = await createPayment(
      context.dataSource,
      wallet.id,
      partner.id,
    );
    await createWalletEntry(context.dataSource, wallet.id, {
      direction: WalletEntryDirection.DEBIT,
      kind: WalletEntryKind.PAYMENT_SENT,
      amount: 12,
      balanceAfter: -12,
      payment: { id: payment.id },
    });

    const response = await listMyWalletEntries(account.cookie).expect(200);

    expect(
      bodyOf<{ items: Array<{ direction: string; label: string | null }> }>(
        response,
      ).items[0],
    ).toMatchObject({
      direction: WalletEntryDirection.DEBIT,
      label: 'Le Bistrot',
    });
  });

  it('carries the allocation label on a credit', async () => {
    const account = await signUp(context.app, 'credit@tickettout.test');
    const wallet = await createWallet(context.dataSource, account.id);
    const employerOwner = await signUp(
      context.app,
      'credit-employer-owner@tickettout.test',
    );
    const employer = await createEmployer(context.dataSource, employerOwner.id);
    const allocation = await createAllocation(
      context.dataSource,
      employer.id,
      employerOwner.id,
      { label: 'Titres-restaurant janvier' },
    );
    await createWalletEntry(context.dataSource, wallet.id, {
      direction: WalletEntryDirection.CREDIT,
      kind: WalletEntryKind.ALLOCATION_RECEIVED,
      amount: 40,
      balanceAfter: 40,
      allocation: { id: allocation.id },
    });

    const response = await listMyWalletEntries(account.cookie).expect(200);

    expect(
      bodyOf<{ items: Array<{ direction: string; label: string | null }> }>(
        response,
      ).items[0],
    ).toMatchObject({
      direction: WalletEntryDirection.CREDIT,
      label: 'Titres-restaurant janvier',
    });
  });

  it('orders entries most recent first and follows the cursor across pages', async () => {
    const account = await signUp(context.app, 'pagination@tickettout.test');
    const wallet = await createWallet(context.dataSource, account.id);
    const first = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 1,
      balanceAfter: 1,
    });
    const second = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 2,
      balanceAfter: 3,
    });
    const third = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 3,
      balanceAfter: 6,
    });

    const firstPage = await listMyWalletEntries(
      account.cookie,
      '?limit=2',
    ).expect(200);
    const firstBody = bodyOf<{
      items: Array<{ id: string }>;
      nextCursor: string | null;
      hasMore: boolean;
    }>(firstPage);

    expect(firstBody.items.map((item) => item.id)).toEqual([
      third.id,
      second.id,
    ]);
    expect(firstBody.hasMore).toBe(true);
    expect(firstBody.nextCursor).not.toBeNull();

    const secondPage = await listMyWalletEntries(
      account.cookie,
      `?limit=2&cursor=${firstBody.nextCursor}`,
    ).expect(200);
    const secondBody = bodyOf<{
      items: Array<{ id: string }>;
      hasMore: boolean;
    }>(secondPage);

    expect(secondBody.items.map((item) => item.id)).toEqual([first.id]);
    expect(secondBody.hasMore).toBe(false);
  });

  it('answers 404 when the connected account has no wallet', async () => {
    const account = await signUp(
      context.app,
      'entries-sans-portefeuille@tickettout.test',
    );

    const response = await listMyWalletEntries(account.cookie).expect(404);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'WALLET_NOT_FOUND',
    );
  });

  it('refuses a partner', async () => {
    const account = await signUp(
      context.app,
      'entries-partenaire@tickettout.test',
    );
    await grantRole(context, account.id, ROLES.PARTNER);
    await createWallet(context.dataSource, account.id);

    const response = await listMyWalletEntries(account.cookie).expect(403);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('refuses a request with no session', async () => {
    await api(context.app).get(apiPath('/me/wallet/entries')).expect(401);
  });
});
