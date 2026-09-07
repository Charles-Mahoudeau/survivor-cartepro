import { ROLES } from '@/config/auth/auth.constants';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { WalletEntryKind, WalletStatus } from '@/modules/wallets/enums';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import { createAllocation } from '../../../../test/fixtures/allocation.fixture';
import { createEmployer } from '../../../../test/fixtures/employer.fixture';
import {
  createUser,
  grantRole,
  signUp,
} from '../../../../test/fixtures/user.fixture';
import {
  createWallet,
  createWalletEntry,
} from '../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../test/http';
import { Allocation } from '../entities/allocation.entity';
import { AllocationStatus } from '../enums/allocation-status.enum';

const ACTIVE_WALLETS = 42;
const SUSPENDED_WALLETS = 2;
const AMOUNT = 90;

let context: TestApp;
let sequence = 0;

interface AppliedBody {
  status: AllocationStatus;
  appliedAt: string;
  creditedCount: number;
  total: string;
  excluded: { walletId: string }[];
}

const applyAllocation = (cookie: string[], id: string) =>
  api(context.app)
    .post(apiPath(`/allocations/${id}/apply`))
    .set('Cookie', cookie);

async function seedCampaign() {
  const agent = await signUp(
    context.app,
    `agent-${++sequence}-${Date.now()}@tickettout.test`,
  );
  await grantRole(context, agent.id, ROLES.ADMIN);

  const employer = await createEmployer(context.dataSource, agent.id);
  const active: Wallet[] = [];
  const suspended: Wallet[] = [];

  for (let index = 0; index < ACTIVE_WALLETS + SUSPENDED_WALLETS; index++) {
    const holder = await createUser(
      context,
      `Porteur ${index}`,
      `holder-${++sequence}-${Date.now()}@tickettout.test`,
    );
    const isActive = index < ACTIVE_WALLETS;
    const wallet = await createWallet(context.dataSource, holder.id, {
      employer: { id: employer.id },
      employeeRef: `EMP-${index}`,
      balance: 0,
      status: isActive ? WalletStatus.ACTIVE : WalletStatus.DISABLED,
    });
    (isActive ? active : suspended).push(wallet);
  }

  const allocation = await createAllocation(
    context.dataSource,
    employer.id,
    agent.id,
    { amount: AMOUNT },
  );

  return { agent, employer, allocation, active, suspended };
}

function countEntries(allocationId: string): Promise<number> {
  return context.dataSource
    .getRepository(WalletEntry)
    .countBy({ allocation: { id: allocationId } });
}

function readBalances(walletIds: string[]): Promise<Wallet[]> {
  return context.dataSource
    .getRepository(Wallet)
    .find({ where: walletIds.map((id) => ({ id })) });
}

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('POST /allocations/:id/apply', () => {
  it('credits every active wallet once, and skips the suspended ones', async () => {
    const { agent, allocation, active, suspended } = await seedCampaign();

    const response = await applyAllocation(agent.cookie, allocation.id).expect(
      200,
    );
    const applied = bodyOf<AppliedBody>(response);

    expect(applied).toMatchObject({
      status: AllocationStatus.APPLIED,
      creditedCount: ACTIVE_WALLETS,
      total: '3780.00',
    });
    expect(applied.excluded).toHaveLength(SUSPENDED_WALLETS);
    expect(applied.appliedAt).not.toBeNull();

    await expect(countEntries(allocation.id)).resolves.toBe(ACTIVE_WALLETS);

    const credited = await readBalances(active.map((wallet) => wallet.id));
    expect(credited.map((wallet) => wallet.balance)).toEqual(
      Array<string>(ACTIVE_WALLETS).fill('90.00'),
    );

    const skipped = await readBalances(suspended.map((wallet) => wallet.id));
    expect(skipped.map((wallet) => wallet.balance)).toEqual(
      Array<string>(SUSPENDED_WALLETS).fill('0.00'),
    );
  });

  it('writes a movement of the allocation kind, carrying the resulting balance', async () => {
    const { agent, allocation, active } = await seedCampaign();

    await applyAllocation(agent.cookie, allocation.id).expect(200);

    const entry = await context.dataSource.getRepository(WalletEntry).findOne({
      where: { wallet: { id: active[0].id } },
      relations: { allocation: true },
    });

    expect(entry).toMatchObject({
      amount: '90.00',
      balanceAfter: '90.00',
      kind: WalletEntryKind.ALLOCATION_RECEIVED,
    });
    expect(entry?.allocation?.id).toBe(allocation.id);
  });

  it('answers 409 on a second apply, and credits nobody twice', async () => {
    const { agent, allocation, active } = await seedCampaign();
    await applyAllocation(agent.cookie, allocation.id).expect(200);

    await applyAllocation(agent.cookie, allocation.id).expect(409);

    await expect(countEntries(allocation.id)).resolves.toBe(ACTIVE_WALLETS);
    const credited = await readBalances(active.map((wallet) => wallet.id));
    expect(credited.map((wallet) => wallet.balance)).toEqual(
      Array<string>(ACTIVE_WALLETS).fill('90.00'),
    );
  });

  it('leaves no partial credit when a movement cannot be written', async () => {
    const { agent, allocation, active } = await seedCampaign();
    await createWalletEntry(context.dataSource, active[0].id, {
      allocation: { id: allocation.id },
    });

    await applyAllocation(agent.cookie, allocation.id).expect(500);

    await expect(countEntries(allocation.id)).resolves.toBe(1);
    const untouched = await readBalances(active.map((wallet) => wallet.id));
    expect(untouched.map((wallet) => wallet.balance)).toEqual(
      Array<string>(ACTIVE_WALLETS).fill('0.00'),
    );
    await expect(
      context.dataSource
        .getRepository(Allocation)
        .findOneBy({ id: allocation.id }),
    ).resolves.toMatchObject({
      status: AllocationStatus.DRAFT,
      appliedAt: null,
    });
  });

  it('leaves every balance equal to the sum of its movements', async () => {
    const { agent, allocation, active } = await seedCampaign();

    await applyAllocation(agent.cookie, allocation.id).expect(200);

    const wallets = await context.dataSource.getRepository(Wallet).find({
      where: active.map((wallet) => ({ id: wallet.id })),
      relations: { entries: true },
    });

    for (const wallet of wallets) {
      const movements = wallet.entries.reduce(
        (sum, entry) => sum + Number(entry.amount),
        0,
      );
      expect(Number(wallet.balance)).toBe(movements);
      expect(Number(wallet.entries.at(-1)?.balanceAfter)).toBe(
        Number(wallet.balance),
      );
    }
  });

  it('refuses an employee, and credits nobody', async () => {
    const { allocation } = await seedCampaign();
    const employee = await signUp(context.app, 'salarie@tickettout.test');

    await applyAllocation(employee.cookie, allocation.id).expect(403);

    await expect(countEntries(allocation.id)).resolves.toBe(0);
  });
});
