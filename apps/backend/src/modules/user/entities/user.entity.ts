import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Account } from './account.entity';
import { Session } from './session.entity';

/**
 * An account able to sign in.
 *
 * The shape is Better Auth's, because Better Auth reads and writes this table
 * through its own connection. What is ours is the schema: these entities are
 * what `db:generate` diffs, so the table is created, altered and dropped by our
 * migrations like every other table of this API — and a foreign key from a
 * business table to `user.id` is an ordinary relation rather than a reference
 * to something the ORM cannot see.
 *
 * Nothing here runs at runtime for authentication. Better Auth does not go
 * through TypeORM, so `@CreateDateColumn` and friends describe the DDL, not a
 * lifecycle: the timestamps that land in this table are the ones the library
 * writes.
 *
 * Columns are snake_case, like the rest of the schema. Better Auth is told the
 * mapping in `src/config/auth/auth.ts` — one place, next to the connection that
 * uses it.
 *
 * `role`, `banned`, `banReason` and `banExpires` come from the admin plugin.
 * They are declared here rather than left to the library because the schema is
 * ours: a column no entity declares is a column `db:generate` would propose to
 * drop.
 */
@Entity('user')
export class User {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('boolean', { default: false })
  emailVerified: boolean;

  @Column('text', { nullable: true })
  image: string | null;

  /** `user` when the account is created by sign-up, from the plugin default. */
  @Column('text', { nullable: true })
  role: string | null;

  @Column('boolean', { nullable: true, default: false })
  banned: boolean | null;

  @Column('text', { nullable: true })
  banReason: string | null;

  /** Null on a permanent ban. A date in the past means the ban is over. */
  @Column('timestamptz', { nullable: true })
  banExpires: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Relation<Session[]>;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Relation<Account[]>;
}
