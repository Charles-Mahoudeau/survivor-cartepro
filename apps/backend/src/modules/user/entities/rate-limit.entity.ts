import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * The request counter behind the rate limit on the authentication routes. A
 * table rather than a process-local map, which would reset on every deployment.
 *
 * `lastRequest` is an epoch in milliseconds, hence `bigint` — and TypeORM reads
 * a `bigint` as a string.
 */
@Entity('rate_limit')
export class RateLimit {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  /** Route and caller, as the library composes it. */
  @Column('text', { unique: true })
  key: string;

  @Column('integer')
  count: number;

  @Column('bigint')
  lastRequest: string;
}
