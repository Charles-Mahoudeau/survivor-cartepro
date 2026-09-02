import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { Partner } from '@/modules/partners/entities/partner.entity';

@Entity()
export class PartnerCategory {
  @PrimaryColumn({ type: 'text' })
  slug: string;

  @Column({ type: 'text' })
  displayName: string;

  @ManyToMany(() => Partner, (partner) => partner.categories)
  partners: Partner[];
}
