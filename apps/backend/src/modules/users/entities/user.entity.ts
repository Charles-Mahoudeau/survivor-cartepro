import { Entity, OneToMany, OneToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Employer } from '@/modules/employers/entities/employer.entity';
import { Partner } from '@/modules/partners/entities/partner.entity';
import { PartnerReview } from '@/modules/partners/entities/partner-review.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';

@Entity()
export class User {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @OneToOne(() => Employer, (employer) => employer.owner)
  employer: Relation<Employer>;

  @OneToOne(() => Partner, (partner) => partner.owner)
  partner: Relation<Partner>;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Relation<Wallet>[];

  @OneToMany(() => PartnerReview, (partnerReview) => partnerReview.decidedBy)
  decidedPartnerReviews: Relation<PartnerReview>[];

  @OneToMany(() => Allocation, (allocation) => allocation.createdBy)
  createdAllocations: Relation<Allocation>[];
}
