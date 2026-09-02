import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Employer } from '@/modules/employers/entities/employer.entity';
import { User } from '@/modules/users/entities/user.entity';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';

@Entity()
@Check('CHK_allocation_amount_positive', 'amount > 0')
export class Allocation {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => Employer, (employer) => employer.allocations)
  @JoinColumn({ name: 'employer_id' })
  employer: Relation<Employer>;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @ManyToOne(() => User, (user) => user.createdAllocations)
  @JoinColumn({ name: 'created_by' })
  createdBy: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => WalletEntry, (entry) => entry.allocation)
  walletEntries: Relation<WalletEntry>[];
}
