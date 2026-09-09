import type { DataSource, DeepPartial } from 'typeorm';
import { IsNull } from 'typeorm';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { WalletEntryDirection } from '@/modules/wallets/enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '@/modules/wallets/enums/wallet-entry-kind.enum';
import { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';

/**
 * Signing up already opens a personal wallet for `userId`. When the override
 * doesn't target an employer-scoped wallet, this replaces that one instead of
 * colliding with the one-personal-wallet-per-user constraint.
 */
export async function createWallet(
  dataSource: DataSource,
  userId: string,
  overrides: DeepPartial<Wallet> = {},
): Promise<Wallet> {
  const repo = dataSource.getRepository(Wallet);
  if (overrides.employer === undefined) {
    await repo.delete({ user: { id: userId }, employer: IsNull() });
  }
  return repo.save({
    user: { id: userId },
    balance: 0,
    currency: 'EUR',
    status: WalletStatus.ACTIVE,
    ...overrides,
  });
}

/** Suspends a wallet that already holds something a spec issued while it was active. */
export async function suspendWallet(
  dataSource: DataSource,
  walletId: string,
): Promise<void> {
  await dataSource
    .getRepository(Wallet)
    .update({ id: walletId }, { status: WalletStatus.DISABLED });
}

export function createWalletEntry(
  dataSource: DataSource,
  walletId: string,
  overrides: DeepPartial<WalletEntry> = {},
): Promise<WalletEntry> {
  return dataSource.getRepository(WalletEntry).save({
    wallet: { id: walletId },
    direction: WalletEntryDirection.CREDIT,
    amount: 10,
    balanceAfter: 10,
    kind: WalletEntryKind.PAYMENT_RECEIVED,
    ...overrides,
  });
}
