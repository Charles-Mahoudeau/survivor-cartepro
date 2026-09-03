import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Partner } from '@/modules/partners/entities/partner.entity';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { PaymentToken } from '@/modules/payments/entities/payment-token.entity';
import { CaptureMode } from '@/modules/payments/enums/capture-mode.enum';

@Entity()
@Index('IDX_payment_wallet_id', ['wallet'])
@Index('IDX_payment_partner_id', ['partner'])
@Check('CHK_payment_amount_positive', 'amount > 0')
export class Payment {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.payments, { nullable: false })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Relation<Wallet>;

  @ManyToOne(() => Partner, (partner) => partner.payments, { nullable: false })
  @JoinColumn({ name: 'partner_id' })
  partner: Relation<Partner>;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @OneToOne(() => PaymentToken, (paymentToken) => paymentToken.payment, {
    nullable: false,
  })
  @JoinColumn({ name: 'payment_token_id' })
  paymentToken: Relation<PaymentToken>;

  @Column({ type: 'enum', enum: CaptureMode })
  captureMode: CaptureMode;

  @OneToMany(() => WalletEntry, (entry) => entry.payment)
  walletEntries: Relation<WalletEntry>[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
