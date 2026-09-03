import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity';

@Entity('account')
@Unique('account_issuer_account_id_uidx', ['issuer', 'accountId'])
export class Account {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('text')
  issuer: string;

  @Column('text')
  accountId: string;

  @Column('text')
  providerId: string;

  @Column('text', { nullable: true })
  password: string | null;

  @Column('text', { nullable: true })
  accessToken: string | null;

  @Column('text', { nullable: true })
  refreshToken: string | null;

  @Column('text', { nullable: true })
  idToken: string | null;

  @Column('timestamptz', { nullable: true })
  accessTokenExpiresAt: Date | null;

  @Column('timestamptz', { nullable: true })
  refreshTokenExpiresAt: Date | null;

  @Column('text', { nullable: true })
  scope: string | null;

  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
