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

/**
 * A way of proving one is a given user.
 *
 * The password hash lives here, not on `user`. That separation is what keeps it
 * out of every projection that serves a profile: a query that selects a user
 * cannot accidentally carry a credential it never joined.
 *
 * A credential account has `providerId = 'credential'` and a `password`; a
 * social account would have tokens and no password. The pair
 * (`issuer`, `accountId`) is unique, so linking the same external identity
 * twice is refused by the database rather than by a check someone can forget.
 */
@Entity('account')
@Unique('account_issuer_account_id_uidx', ['issuer', 'accountId'])
export class Account {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  /** Who vouches for the identity: `credential` for an email and password. */
  @Column('text')
  issuer: string;

  /** The identity as that issuer names it. */
  @Column('text')
  accountId: string;

  @Column('text')
  providerId: string;

  /** Scrypt hash. Null on a social account, which proves identity otherwise. */
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
