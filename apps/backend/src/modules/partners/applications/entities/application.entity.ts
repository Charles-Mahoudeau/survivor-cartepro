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
import { User } from '@/modules/user/entities/user.entity';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

// Physical table name is pinned to its pre-merge value so the rename stays a
// pure class rename (no destructive DROP/CREATE emitted by db:generate).
@Entity('partner_review')
@Index('IDX_partner_application_partner_id', ['partner'])
export class Application {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @ManyToOne(() => Partner, (partner) => partner.applications, {
    nullable: false,
  })
  @JoinColumn({ name: 'partner_id' })
  partner: Relation<Partner>;

  @Column({ type: 'enum', enum: PartnerStatus })
  fromStatus: PartnerStatus;

  @Column({ type: 'enum', enum: PartnerStatus })
  toStatus: PartnerStatus;

  @Column({ type: 'text' })
  reason: string;

  @ManyToOne(() => User, (user) => user.decidedApplications, {
    nullable: false,
  })
  @JoinColumn({ name: 'decided_by' })
  decidedBy: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
