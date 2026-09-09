import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { AllocationStatus } from '@/modules/allocations/enums/allocation-status.enum';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from './app';
import { createAllocation } from './fixtures/allocation.fixture';
import { createEmployer } from './fixtures/employer.fixture';
import { createPayment } from './fixtures/payment.fixture';
import { signUp } from './fixtures/user.fixture';
import { createWallet, createWalletEntry } from './fixtures/wallet.fixture';
import { PartnerFixture } from '@/modules/partners/core/specs/partner.fixture';

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

async function createMoneyRows() {
  const account = await signUp(
    context.app,
    `money-tables-${Date.now()}@tickettout.test`,
  );
  const wallet = await createWallet(context.dataSource, account.id);
  const partner = await PartnerFixture.create(context.dataSource, account.id);
  const employer = await createEmployer(context.dataSource);
  const payment = await createPayment(
    context.dataSource,
    wallet.id,
    partner.id,
  );
  const allocation = await createAllocation(
    context.dataSource,
    employer.id,
    account.id,
  );
  const walletEntry = await createWalletEntry(context.dataSource, wallet.id, {
    payment: { id: payment.id },
    allocation: { id: allocation.id },
  });

  return { payment, allocation, walletEntry };
}

describe('money tables immutability', () => {
  it('allows valid inserts and independent reads for all money tables', async () => {
    const { payment, allocation, walletEntry } = await createMoneyRows();

    await expect(
      context.dataSource.getRepository(Payment).findOneBy({ id: payment.id }),
    ).resolves.toMatchObject({ id: payment.id });
    await expect(
      context.dataSource
        .getRepository(Allocation)
        .findOneBy({ id: allocation.id }),
    ).resolves.toMatchObject({ id: allocation.id });
    await expect(
      context.dataSource
        .getRepository(WalletEntry)
        .findOneBy({ id: walletEntry.id }),
    ).resolves.toMatchObject({ id: walletEntry.id });
  });

  it('rejects direct SQL updates and keeps every row unchanged', async () => {
    const { payment, walletEntry } = await createMoneyRows();

    await expect(
      context.dataSource.query(
        'UPDATE "payment" SET "amount" = "amount" + 1 WHERE "id" = $1',
        [payment.id],
      ),
    ).rejects.toThrow('Immutable table');
    await expect(
      context.dataSource.query(
        'UPDATE "wallet_entry" SET "amount" = "amount" + 1 WHERE "id" = $1',
        [walletEntry.id],
      ),
    ).rejects.toThrow('Immutable table');

    await expect(
      context.dataSource.getRepository(Payment).findOneBy({ id: payment.id }),
    ).resolves.toMatchObject({ id: payment.id, amount: '10.00' });
    await expect(
      context.dataSource
        .getRepository(WalletEntry)
        .findOneBy({ id: walletEntry.id }),
    ).resolves.toMatchObject({ id: walletEntry.id, amount: '10.00' });
  });

  it('rejects direct SQL deletes and keeps every row present', async () => {
    const { payment, allocation, walletEntry } = await createMoneyRows();

    await expect(
      context.dataSource.query('DELETE FROM "payment" WHERE "id" = $1', [
        payment.id,
      ]),
    ).rejects.toThrow('Immutable table');
    await expect(
      context.dataSource.query('DELETE FROM "wallet_entry" WHERE "id" = $1', [
        walletEntry.id,
      ]),
    ).rejects.toThrow('Immutable table');
    await expect(
      context.dataSource.query('DELETE FROM "allocation" WHERE "id" = $1', [
        allocation.id,
      ]),
    ).rejects.toThrow('Immutable table');

    await expect(
      context.dataSource.getRepository(Payment).findOneBy({ id: payment.id }),
    ).resolves.toMatchObject({ id: payment.id });
    await expect(
      context.dataSource
        .getRepository(WalletEntry)
        .findOneBy({ id: walletEntry.id }),
    ).resolves.toMatchObject({ id: walletEntry.id });
    await expect(
      context.dataSource
        .getRepository(Allocation)
        .findOneBy({ id: allocation.id }),
    ).resolves.toMatchObject({ id: allocation.id });
  });

  it('rejects TypeORM mutations on an immutable payment', async () => {
    const { payment } = await createMoneyRows();
    const repository = context.dataSource.getRepository(Payment);

    await expect(
      repository.update({ id: payment.id }, { amount: 11 }),
    ).rejects.toThrow('Immutable table');
    await expect(repository.delete({ id: payment.id })).rejects.toThrow(
      'Immutable table',
    );

    await expect(
      repository.findOneBy({ id: payment.id }),
    ).resolves.toMatchObject({ id: payment.id, amount: '10.00' });
  });
});

describe('allocation lifecycle', () => {
  async function createDraftAllocation(): Promise<Allocation> {
    const account = await signUp(
      context.app,
      `allocation-lifecycle-${Date.now()}@tickettout.test`,
    );
    const employer = await createEmployer(context.dataSource);
    return createAllocation(context.dataSource, employer.id, account.id);
  }

  it('lets a draft be edited, then applied once', async () => {
    const allocation = await createDraftAllocation();
    const repository = context.dataSource.getRepository(Allocation);
    const appliedAt = new Date();

    await expect(
      repository.update({ id: allocation.id }, { label: 'Prime de rentrée' }),
    ).resolves.toBeDefined();
    await expect(
      repository.update(
        { id: allocation.id },
        { status: AllocationStatus.APPLIED, appliedAt },
      ),
    ).resolves.toBeDefined();

    await expect(
      repository.findOneBy({ id: allocation.id }),
    ).resolves.toMatchObject({
      label: 'Prime de rentrée',
      status: AllocationStatus.APPLIED,
      appliedAt,
    });
  });

  it('freezes an allocation once it is applied', async () => {
    const allocation = await createDraftAllocation();
    const repository = context.dataSource.getRepository(Allocation);
    await repository.update(
      { id: allocation.id },
      { status: AllocationStatus.APPLIED, appliedAt: new Date() },
    );

    await expect(
      repository.update({ id: allocation.id }, { amount: 999 }),
    ).rejects.toThrow('Immutable table');
    await expect(
      repository.update(
        { id: allocation.id },
        { status: AllocationStatus.DRAFT, appliedAt: null },
      ),
    ).rejects.toThrow('Immutable table');
    await expect(repository.delete({ id: allocation.id })).rejects.toThrow(
      'Immutable table',
    );

    await expect(
      repository.findOneBy({ id: allocation.id }),
    ).resolves.toMatchObject({
      amount: '50.00',
      status: AllocationStatus.APPLIED,
    });
  });

  it('refuses an applied allocation carrying no application date', async () => {
    const allocation = await createDraftAllocation();

    await expect(
      context.dataSource
        .getRepository(Allocation)
        .update({ id: allocation.id }, { status: AllocationStatus.APPLIED }),
    ).rejects.toThrow('CHK_allocation_applied_at_matches_status');
  });
});
