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
import { ROLES } from '@/config/auth/auth.constants';
import { PartnerFixture } from '../../partners/core/specs/partner.fixture';
import { Wallet } from '../entities/wallet.entity';
import { WalletEntryDirection } from '@/modules/wallets/enums';
import { WalletEntryKind } from '@/modules/wallets/enums';
import { WalletStatus } from '@/modules/wallets/enums';

let context: TestApp;
const getMyWallet = (cookie: string[]) =>
  api(context.app).get(apiPath('/me/wallet')).set('Cookie', cookie);
const listMyWalletEntries = (cookie: string[], qs = '') =>
  api(context.app)
    .get(apiPath(`/me/wallet/entries${qs}`))
    .set('Cookie', cookie);
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_IN_MS);
const isoDaysAgo = (days: number) => daysAgo(days).toISOString();

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
    // Sign-up opens one automatically; remove it to exercise this path.
    await context.dataSource
      .getRepository(Wallet)
      .delete({ user: { id: account.id } });

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

describe('wallet balance constraints', () => {
  it('accepts a balance of exactly zero', async () => {
    const account = await signUp(context.app, 'balance-zero@tickettout.test');
    const wallet = await createWallet(context.dataSource, account.id, {
      balance: 0,
    });

    const persistedWallet = await context.dataSource
      .getRepository(Wallet)
      .findOneBy({ id: wallet.id });

    expect(persistedWallet?.balance).toBe((0).toFixed(2));
  });

  it('rejects a negative balance', async () => {
    const account = await signUp(
      context.app,
      'balance-negative@tickettout.test',
    );

    await expect(
      createWallet(context.dataSource, account.id, { balance: -0.01 }),
    ).rejects.toThrow('CHK_wallet_balance_non_negative');
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
    const agent = await signUp(context.app, 'credit-agent@tickettout.test');
    const employer = await createEmployer(context.dataSource);
    const allocation = await createAllocation(
      context.dataSource,
      employer.id,
      agent.id,
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
    // Sign-up opens one automatically; remove it to exercise this path.
    await context.dataSource
      .getRepository(Wallet)
      .delete({ user: { id: account.id } });

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

describe('GET /me/wallet/entries period filter', () => {
  it('reads the last thirty days when no bound is given', async () => {
    const account = await signUp(context.app, 'periode-defaut@tickettout.test');
    const wallet = await createWallet(context.dataSource, account.id);
    await createWalletEntry(context.dataSource, wallet.id, {
      amount: 1,
      balanceAfter: 1,
      createdAt: daysAgo(40),
    });
    const inside = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 2,
      balanceAfter: 3,
      createdAt: daysAgo(5),
    });

    const response = await listMyWalletEntries(account.cookie).expect(200);

    expect(
      bodyOf<{ items: Array<{ id: string }> }>(response).items.map(
        (entry) => entry.id,
      ),
    ).toEqual([inside.id]);
  });

  it('returns only the entries inside explicit bounds', async () => {
    const account = await signUp(context.app, 'periode-bornes@tickettout.test');
    const wallet = await createWallet(context.dataSource, account.id);
    await createWalletEntry(context.dataSource, wallet.id, {
      amount: 1,
      balanceAfter: 1,
      createdAt: daysAgo(20),
    });
    const inside = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 2,
      balanceAfter: 3,
      createdAt: daysAgo(10),
    });
    await createWalletEntry(context.dataSource, wallet.id, {
      amount: 3,
      balanceAfter: 6,
      createdAt: daysAgo(2),
    });

    const response = await listMyWalletEntries(
      account.cookie,
      `?from=${isoDaysAgo(15)}&to=${isoDaysAgo(5)}`,
    ).expect(200);

    expect(
      bodyOf<{ items: Array<{ id: string }> }>(response).items.map(
        (entry) => entry.id,
      ),
    ).toEqual([inside.id]);
  });

  it('keeps the period filter on the page the cursor points to', async () => {
    const account = await signUp(
      context.app,
      'periode-curseur@tickettout.test',
    );
    const wallet = await createWallet(context.dataSource, account.id);
    await createWalletEntry(context.dataSource, wallet.id, {
      amount: 1,
      balanceAfter: 1,
      createdAt: daysAgo(40),
    });
    const first = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 2,
      balanceAfter: 3,
      createdAt: daysAgo(9),
    });
    const second = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 3,
      balanceAfter: 6,
      createdAt: daysAgo(8),
    });
    const third = await createWalletEntry(context.dataSource, wallet.id, {
      amount: 4,
      balanceAfter: 10,
      createdAt: daysAgo(7),
    });
    const from = isoDaysAgo(10);

    const firstPage = await listMyWalletEntries(
      account.cookie,
      `?from=${from}&limit=2`,
    ).expect(200);
    const firstBody = bodyOf<{
      items: Array<{ id: string }>;
      nextCursor: string | null;
      hasMore: boolean;
    }>(firstPage);

    expect(firstBody.items.map((entry) => entry.id)).toEqual([
      third.id,
      second.id,
    ]);
    expect(firstBody.hasMore).toBe(true);

    const secondPage = await listMyWalletEntries(
      account.cookie,
      `?from=${from}&limit=2&cursor=${firstBody.nextCursor}`,
    ).expect(200);
    const secondBody = bodyOf<{
      items: Array<{ id: string }>;
      hasMore: boolean;
    }>(secondPage);

    expect(secondBody.items.map((entry) => entry.id)).toEqual([first.id]);
    expect(secondBody.hasMore).toBe(false);
  });

  it('answers 422 when the bounds are inverted', async () => {
    const account = await signUp(
      context.app,
      'periode-inverse@tickettout.test',
    );
    await createWallet(context.dataSource, account.id);

    const response = await listMyWalletEntries(
      account.cookie,
      `?from=${isoDaysAgo(1)}&to=${isoDaysAgo(10)}`,
    ).expect(422);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'INVALID_PERIOD',
    );
  });

  it('answers 400 when a bound is not an ISO 8601 date', async () => {
    const account = await signUp(
      context.app,
      'periode-illisible@tickettout.test',
    );
    await createWallet(context.dataSource, account.id);

    await listMyWalletEntries(account.cookie, '?from=01/03/2026').expect(400);
  });
});
