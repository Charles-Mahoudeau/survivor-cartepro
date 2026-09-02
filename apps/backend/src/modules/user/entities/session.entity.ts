import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity';

/**
 * One row per open session.
 *
 * This table is what makes signing out mean something: the row is deleted, so
 * the cookie that carried it stops resolving on the next request. A stateless
 * signed token would stay valid until it expired, and there would be nothing to
 * revoke when an account is banned.
 *
 * `ON DELETE CASCADE` is what closes every session of a deleted account without
 * a second query.
 */
@Entity('session')
export class Session {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  /** The value carried by the session cookie. Unique, hence a lookup key. */
  @Column('text', { unique: true })
  token: string;

  @Column('timestamptz')
  expiresAt: Date;

  @Column('text', { nullable: true })
  ipAddress: string | null;

  @Column('text', { nullable: true })
  userAgent: string | null;

  /** Set by the admin plugin while an administrator impersonates the account. */
  @Column('text', { nullable: true })
  impersonatedBy: string | null;

  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
