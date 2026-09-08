import type { DataSource, DeepPartial } from 'typeorm';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { WalletEntryDirection } from '@/modules/wallets/enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '@/modules/wallets/enums/wallet-entry-kind.enum';
import { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';

/**
 * An account holds a single wallet, and signing up already opened it, so this
 * replaces the existing one rather than colliding with it.
 */
export async function createWallet(
  dataSource: DataSource,
  userId: string,
  overrides: DeepPartial<Wallet> = {},
): Promise<Wallet> {
  const repo = dataSource.getRepository(Wallet);
  await repo.delete({ user: { id: userId } });
  return repo.save({
    user: { id: userId },
    balance: 0,
    currency: 'EUR',
    status: WalletStatus.ACTIVE,
    ...overrides,
  });
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
