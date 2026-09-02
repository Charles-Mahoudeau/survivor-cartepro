import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A key for the third-party surface the brief asks for: an HR system reading a
 * balance without a human session (§3.3).
 *
 * No route consumes one yet. The table is declared now so it lands in the same
 * migration as the rest of authentication rather than arriving alone later, and
 * so `db:generate` has nothing to propose the day the plugin is used.
 *
 * `reference_id` carries no foreign key, deliberately. The plugin declares none,
 * and what a key belongs to is not settled: a key for an HR system is more
 * plausibly attached to an employer than to a person. Constraining it to
 * `user.id` today would have to be undone by the lot that answers the question.
 *
 * The rate limit columns are the plugin's own, per key, and unrelated to the
 * `rate_limit` table, which counts requests per address on the sign-in routes.
 */
@Entity('api_key')
export class ApiKey {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  /** Which key configuration this row follows. One config, named, by default. */
  @Column('text', { default: 'default' })
  configId: string;

  @Column('text', { nullable: true })
  name: string | null;

  /** The hashed key. Never served back after creation. */
  @Column('text')
  key: string;

  /** Human-readable head of the key, so a holder can recognise which one it is. */
  @Column('text', { nullable: true })
  start: string | null;

  @Column('text', { nullable: true })
  prefix: string | null;

  /** Whom the key acts for. See the note above on the absent foreign key. */
  @Index()
  @Column('text')
  referenceId: string;

  @Column('boolean', { nullable: true, default: true })
  enabled: boolean | null;

  @Column('integer', { nullable: true })
  refillInterval: number | null;

  @Column('integer', { nullable: true })
  refillAmount: number | null;

  @Column('timestamptz', { nullable: true })
  lastRefillAt: Date | null;

  @Column('integer', { nullable: true })
  remaining: number | null;

  @Column('boolean', { nullable: true, default: true })
  rateLimitEnabled: boolean | null;

  /** Milliseconds. A day by default, which is the plugin's own quota window. */
  @Column('integer', { nullable: true, default: 86400000 })
  rateLimitTimeWindow: number | null;

  @Column('integer', { nullable: true, default: 10 })
  rateLimitMax: number | null;

  @Column('integer', { nullable: true, default: 0 })
  requestCount: number | null;

  @Column('timestamptz', { nullable: true })
  lastRequest: Date | null;

  @Column('timestamptz', { nullable: true })
  expiresAt: Date | null;

  /** JSON, written and read by the plugin. Not parsed by this codebase. */
  @Column('text', { nullable: true })
  permissions: string | null;

  @Column('text', { nullable: true })
  metadata: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
