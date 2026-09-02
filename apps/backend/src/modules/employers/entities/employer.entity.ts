import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PrimaryGeneratedUuidV7Column } from '@/common/decorators/primary-generated-uuid-v7.column';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';

@Entity()
@Unique(['siren'])
export class Employer {
  @PrimaryGeneratedUuidV7Column()
  id: string;

  @OneToOne(() => User, (user) => user.employer, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: Relation<User>;

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
