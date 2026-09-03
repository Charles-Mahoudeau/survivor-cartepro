import type { DataSource } from 'typeorm';

/** TypeORM's history; truncating it would leave the next spec no schema. */
const PROTECTED_TABLES = new Set(['migrations', 'typeorm_metadata']);

/**
 * Empties every application table, keeping the migrated schema.
 *
 * Truncation and not a rollback, for a reason specific to this application:
 * Better Auth writes through its OWN pool. Fixtures built inside a TypeORM
 * transaction would be invisible to it, and its writes would survive the
 * rollback — the isolation would be an illusion in both directions.
 *
 * `rate_limit` is cleared with the rest. Its key is address plus path and every
 * request comes from the same address, so a spec that signs in six times would
 * hand the next one a 429 of its own making.
 */
export async function truncateAll(dataSource: DataSource): Promise<void> {
  const rows: Array<{ tablename: string }> = await dataSource.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );

  const tables = rows
    .map((row) => row.tablename)
    .filter((table) => !PROTECTED_TABLES.has(table))
    .map((table) => `"${table}"`);

  if (tables.length === 0) {
    return;
  }

  await dataSource.query(
    `TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`,
  );
}

/**
 * Empties the rate limit table alone, leaving every fixture in place.
 *
 * A spec that measures how long a refusal takes needs more attempts than the
 * sign-in limit allows, and it cannot reach for `truncateAll`: that would drop
 * the very account whose password it is getting wrong.
 */
export async function truncateRateLimit(dataSource: DataSource): Promise<void> {
  await dataSource.query(`TRUNCATE TABLE "rate_limit"`);
}
