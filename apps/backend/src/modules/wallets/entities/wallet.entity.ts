import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Employer } from '@/modules/employers/entities/employer.entity';
import { PaymentToken } from '@/modules/payments/entities/payment-token.entity';
import { Payment } from '@/modules/payments/entities/payment.entity';
import { User } from '@/modules/users/entities/user.entity';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';
import { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';

@Entity()
@Index(['user', 'employer'], { unique: true })
@Index(['employer', 'employeeRef'], { unique: true })
@Check('CHK_wallet_balance_non_negative', 'balance >= 0')
export class Wallet {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Employer, (employer) => employer.wallets, { nullable: true })
  @JoinColumn({ name: 'employer_id' })
  employer: Relation<Employer> | null;

  @Column({ type: 'text', nullable: true })
  employeeRef: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  balance: number;

  @Column({ type: 'char', length: 3, default: 'EUR' })
  currency: string;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @OneToMany(() => WalletEntry, (entry) => entry.wallet)
  entries: Relation<WalletEntry>[];

  @OneToMany(() => PaymentToken, (paymentToken) => paymentToken.wallet)
  paymentTokens: Relation<PaymentToken>[];

  @OneToMany(() => Payment, (payment) => payment.wallet)
  payments: Relation<Payment>[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
