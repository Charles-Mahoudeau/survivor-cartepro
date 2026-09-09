import type { DataSource } from 'typeorm';

/**
 * Creates the restricted application role, or resyncs its password if it
 * already exists. Idempotent, and cheap enough to call before every
 * migration run: a migration's own DCL (the `audit_log` `REVOKE`, for
 * instance) targets this role by name, so it must already exist by the
 * time migrations run, not only once they finish.
 */
export async function ensureApplicationRoleExists(
  dataSource: DataSource,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const appUser = env.DATABASE_USER || 'cartepro_app';
  const appPassword = env.DATABASE_PASSWORD || 'cartepro_app';

  await dataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${appUser}') THEN
        CREATE ROLE "${appUser}" LOGIN PASSWORD '${appPassword}';
      ELSE
        ALTER ROLE "${appUser}" WITH LOGIN PASSWORD '${appPassword}';
      END IF;
    END
    $$;
  `);
}

/**
 * Tables a migration deliberately narrows the application role's grants on
 * (`audit_log`'s `REVOKE UPDATE, DELETE, TRUNCATE`) — the blanket grant
 * below must never re-widen these, or every re-run of `db:migrate` would
 * quietly undo the very restriction this whole split exists to enforce.
 * They still get SELECT/INSERT, which no migration revokes.
 */
const HARDENED_TABLES = ['audit_log'];

/**
 * Grants the application role exactly SELECT/INSERT/UPDATE/DELETE on the
 * schema's ordinary tables, and only SELECT/INSERT on `HARDENED_TABLES` —
 * never schema DDL, never role management. Call after migrations run, so
 * it covers whatever they just created.
 *
 * `ALTER DEFAULT PRIVILEGES` is what makes this self-maintaining for
 * ordinary tables: one a *later* migration creates grants the application
 * role DML the moment the admin role that owns it creates it, with no
 * per-migration bookkeeping — this call only needs to also cover tables
 * that already existed before that default took effect. A hardened table's
 * own migration is the only place its restriction is ever expressed.
 */
export async function grantApplicationRolePrivileges(
  dataSource: DataSource,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const appUser = env.DATABASE_USER || 'cartepro_app';
  const adminUser = env.DATABASE_ADMIN_USER || 'cartepro';
  const hardenedList = HARDENED_TABLES.map((table) => `'${table}'`).join(', ');

  await dataSource.query(`GRANT USAGE ON SCHEMA public TO "${appUser}"`);

  await dataSource.query(`
    DO $$
    DECLARE
      ordinary_table text;
    BEGIN
      FOR ordinary_table IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename NOT IN (${hardenedList})
      LOOP
        EXECUTE format(
          'GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO %I',
          ordinary_table,
          '${appUser}'
        );
      END LOOP;
    END
    $$;
  `);

  for (const table of HARDENED_TABLES) {
    await dataSource.query(
      `GRANT SELECT, INSERT ON "${table}" TO "${appUser}"`,
    );
  }

  await dataSource.query(
    `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${appUser}"`,
  );
  await dataSource.query(
    `ALTER DEFAULT PRIVILEGES FOR ROLE "${adminUser}" IN SCHEMA public ` +
      `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${appUser}"`,
  );
  await dataSource.query(
    `ALTER DEFAULT PRIVILEGES FOR ROLE "${adminUser}" IN SCHEMA public ` +
      `GRANT USAGE, SELECT ON SEQUENCES TO "${appUser}"`,
  );
}
