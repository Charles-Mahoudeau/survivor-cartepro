import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Account } from './account.entity';
import { Session } from './session.entity';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { Employer } from '@/modules/employers/entities/employer.entity';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerApplication } from '@/modules/partners/applications/entities/partner-application.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';

@Entity('user')
export class User {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('boolean', { default: false })
  emailVerified: boolean;

  @Column('text', { nullable: true })
  image: string | null;

  @Column('text', { nullable: true })
  role: string | null;

  @Column('boolean', { nullable: true, default: false })
  banned: boolean | null;

  @Column('text', { nullable: true })
  banReason: string | null;

  @Column('timestamptz', { nullable: true })
  banExpires: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Relation<Session[]>;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Relation<Account[]>;

  @OneToOne(() => Employer, (employer) => employer.owner)
  employer: Relation<Employer> | null;

  @OneToOne(() => Partner, (partner) => partner.owner)
  partner: Relation<Partner> | null;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Relation<Wallet[]>;

  @OneToMany(
    () => PartnerApplication,
    (partnerApplication) => partnerApplication.decidedBy,
  )
  decidedPartnerApplications: Relation<PartnerApplication[]>;

  @OneToMany(() => Allocation, (allocation) => allocation.createdBy)
  createdAllocations: Relation<Allocation[]>;
}
