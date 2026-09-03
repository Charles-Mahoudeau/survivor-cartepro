import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { User } from '@/modules/user/entities/user.entity';
import { PartnerCategory } from '@/modules/partners/entities/partner-category.entity';
import { PartnerReview } from '@/modules/partners/entities/partner-review.entity';
import { Payment } from '@/modules/payments/entities/payment.entity';
import { PartnerStatus } from '@/modules/partners/enums/partner-status.enum';

@Entity()
@Unique(['siren'])
export class Partner {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @OneToOne(() => User, (user) => user.partner, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: Relation<User>;

  @Column({ type: 'text' })
  legalName: string;

  @Column({ type: 'text' })
  tradeName: string;

  @Column({ type: 'char', length: 9 })
  siren: string;

  @Column({ type: 'text' })
  businessPurpose: string;

  @Column({
    type: 'enum',
    enum: PartnerStatus,
    default: PartnerStatus.PENDING,
  })
  status: PartnerStatus;

  @ManyToMany(() => PartnerCategory, (category) => category.partners)
  @JoinTable({
    name: 'partner_to_category',
    joinColumn: { name: 'partner_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_slug', referencedColumnName: 'slug' },
  })
  categories: Relation<PartnerCategory>[];

  @Column({ type: 'text' })
  addressLine: string;

  @Column({ type: 'text' })
  postalCode: string;

  @Column({ type: 'text' })
  city: string;

  @Column({
    type: 'numeric',
    precision: 9,
    scale: 6,
  })
  latitude: number;

  @Column({
    type: 'numeric',
    precision: 9,
    scale: 6,
  })
  longitude: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => PartnerReview, (partnerReview) => partnerReview.partner)
  reviews: Relation<PartnerReview>[];

  @OneToMany(() => Payment, (payment) => payment.partner)
  payments: Relation<Payment>[];
}
