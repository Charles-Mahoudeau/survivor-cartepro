import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { User } from '@/modules/users/entities/user.entity';
import { Partner } from '@/modules/partners/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/enums/partner-status.enum';

@Entity()
@Index('IDX_partner_review_partner_id', ['partner'])
export class PartnerReview {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => Partner, (partner) => partner.reviews, { nullable: false })
  @JoinColumn({ name: 'partner_id' })
  partner: Relation<Partner>;

  @Column({
    type: 'enum',
    enum: PartnerStatus,
    enumName: 'partner_status_enum',
  })
  fromStatus: PartnerStatus;

  @Column({
    type: 'enum',
    enum: PartnerStatus,
    enumName: 'partner_status_enum',
  })
  toStatus: PartnerStatus;

  @Column({ type: 'text' })
  reason: string;

  @ManyToOne(() => User, (user) => user.decidedPartnerReviews, {
    nullable: false,
  })
  @JoinColumn({ name: 'decided_by' })
  decidedBy: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
