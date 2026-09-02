import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * The request counter behind the rate limit on the authentication routes.
 *
 * It is a table rather than a process-local map because an in-memory counter
 * resets on every restart: on a deployment day that hands an attacker a fresh
 * budget each time the process comes back.
 *
 * `lastRequest` is an epoch in milliseconds written by the library, not a
 * timestamp — hence `bigint` rather than `timestamptz`. TypeORM reads a
 * `bigint` as a string, which is why nothing here should be compared as a
 * number without being converted first.
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
