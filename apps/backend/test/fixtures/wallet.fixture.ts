import type { DataSource } from 'typeorm';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { WalletEntryDirection } from '@/modules/wallets/enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '@/modules/wallets/enums/wallet-entry-kind.enum';
import { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';

export function createWallet(
  dataSource: DataSource,
  userId: string,
  overrides: Partial<Wallet> = {},
): Promise<Wallet> {
  return dataSource.getRepository(Wallet).save({
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
  overrides: Partial<WalletEntry> = {},
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
