import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Payment } from '@/modules/payments/entities/payment.entity';
import { PaymentTokenStatus } from '@/modules/payments/enums/payment-token-status.enum';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';

@Entity()
@Index(['shortCode'], { unique: true, where: `"status" = 'live'` })
export class PaymentToken {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.paymentTokens, {
    nullable: false,
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Relation<Wallet>;

  @Column({ type: 'char', length: 8 })
  shortCode: string;

  @Column({ type: 'enum', enum: PaymentTokenStatus })
  status: PaymentTokenStatus;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @OneToOne(() => Payment, (payment) => payment.paymentToken)
  payment: Relation<Payment>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
