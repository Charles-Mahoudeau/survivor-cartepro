import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A key for the third-party surface of §3.3 — an HR system reading a balance
 * without a human session. No route consumes one yet.
 *
 * `reference_id` carries no foreign key on purpose: the plugin declares none,
 * and a key for an HR system is more plausibly attached to an employer than to
 * a person. Constraining it to `user.id` would have to be undone later.
 *
 * The rate limit columns here are per key, unrelated to the `rate_limit` table.
 *
 * `key`, `config_id` and `reference_id` are indexed because the plugin declares
 * them so. `db:generate` would never propose them on its own: it only adds an
 * index alongside a column it is creating.
 */
@Entity('api_key')
export class ApiKey {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  /** Which key configuration this row follows. One config, named, by default. */
  @Index()
  @Column('text', { default: 'default' })
  configId: string;

  @Column('text', { nullable: true })
  name: string | null;

  /** The hashed key, looked up on every authenticated third-party request. */
  @Index()
  @Column('text')
  key: string;

  /** Head of the key, so a holder can recognise which one it is. */
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

  /** Milliseconds; a day, the plugin's own quota window. */
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

  /** JSON, written and read by the plugin only. */
  @Column('text', { nullable: true })
  permissions: string | null;

  @Column('text', { nullable: true })
  metadata: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
