import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { AllocationStatus } from '@/modules/allocations/enums/allocation-status.enum';
import { Employer } from '@/modules/employers/entities/employer.entity';
import { User } from '@/modules/user/entities/user.entity';
import { WalletEntry } from '@/modules/wallets/entities/wallet-entry.entity';

@Entity()
@Index('IDX_allocation_employer_id', ['employer'])
@Check('CHK_allocation_amount_positive', 'amount > 0')
@Check(
  'CHK_allocation_applied_at_matches_status',
  `("status" = 'applied') = ("applied_at" IS NOT NULL)`,
)
export class Allocation {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => Employer, (employer) => employer.allocations, {
    nullable: false,
  })
  @JoinColumn({ name: 'employer_id' })
  employer: Relation<Employer>;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: AllocationStatus,
    default: AllocationStatus.DRAFT,
  })
  status: AllocationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  appliedAt: Date | null;

  @ManyToOne(() => User, (user) => user.createdAllocations, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => WalletEntry, (entry) => entry.allocation)
  walletEntries: Relation<WalletEntry>[];
}
