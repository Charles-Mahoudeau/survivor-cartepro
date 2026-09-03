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
 * The shape is Better Auth's, the schema is ours: `db:generate` diffs these
 * entities, so a foreign key from a business table to `user.id` is an ordinary
 * relation rather than a reference to something the ORM cannot see.
 *
 * Nothing here runs for authentication. The library does not go through
 * TypeORM, so `@CreateDateColumn` and friends describe the DDL, not a lifecycle.
 *
 * The admin plugin's columns are declared here too: a column no entity declares
 * is one `db:generate` would propose to drop.
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

  /** `employee` on sign-up, from the plugin default. */
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
