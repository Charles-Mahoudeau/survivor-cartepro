import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { WalletEntryDirection } from '@/modules/wallets/enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '@/modules/wallets/enums/wallet-entry-kind.enum';

@Entity()
@Index('IDX_wallet_entry_wallet_id', ['wallet'])
@Index('IDX_wallet_entry_payment_id', ['payment'])
@Index('IDX_wallet_entry_allocation_id', ['allocation'])
@Check('CHK_wallet_entry_amount_positive', 'amount > 0')
export class WalletEntry {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.entries, { nullable: false })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Relation<Wallet>;

  @Column({ type: 'enum', enum: WalletEntryDirection })
  direction: WalletEntryDirection;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'enum', enum: WalletEntryKind })
  kind: WalletEntryKind;

  @ManyToOne(() => Payment, (payment) => payment.walletEntries, {
    nullable: true,
  })
  @JoinColumn({ name: 'payment_id' })
  payment: Relation<Payment> | null;

  @ManyToOne(() => Allocation, (allocation) => allocation.walletEntries, {
    nullable: true,
  })
  @JoinColumn({ name: 'allocation_id' })
  allocation: Relation<Allocation> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
