import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';

@Entity()
@Unique(['siren'])
export class Employer {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'char', length: 9 })
  siren: string;

  @OneToMany(() => Wallet, (wallet) => wallet.employer)
  wallets: Relation<Wallet>[];

  @OneToMany(() => Allocation, (allocation) => allocation.employer)
  allocations: Relation<Allocation>[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
