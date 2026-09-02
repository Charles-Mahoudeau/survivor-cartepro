import type { DataSource } from 'typeorm';

/**
 * Never emptied: TypeORM's migration history, applied once when the container
 * boots. Truncating it would make the next spec run against an empty schema.
 */
const PROTECTED_TABLES = new Set(['migrations', 'typeorm_metadata']);

/**
 * Empties every application table, keeping the migrated schema.
 *
 * Truncation rather than a transaction rolled back per test, for a reason
 * specific to this application: Better Auth writes through its OWN connection
 * pool. A test that opened a TypeORM transaction would build fixtures the
 * library cannot see, and the library's own writes would survive the rollback —
 * the isolation would be an illusion in both directions.
 *
 * Committing for real also keeps the things worth testing observable: unique
 * constraints actually raise, cascades actually cascade, and the rate limit
 * counter is a row like any other.
 *
 * `rate_limit` deserves a note. Its key is address plus path, and every request
 * of the suite comes from the same address — so a spec that signs in six times
 * would hand the next one a 429 for reasons that have nothing to do with it.
 * Clearing it between tests is not tidiness, it is what keeps the specs
 * independent of their order.
 *
 * `CASCADE` handles the foreign key order, `RESTART IDENTITY` the sequences.
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
