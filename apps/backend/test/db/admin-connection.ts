import { Client } from 'pg';

/**
 * Opens a connection as the privileged role — never the application's own,
 * which is deliberately restricted (see `ensure-application-role.ts`).
 * Used only where a test genuinely needs elevated access: purging fixtures
 * between tests, and simulating a privileged operator tampering directly
 * with the database.
 *
 * Reads from `process.env`, set once per worker by `setup-integration.ts`.
 */
export async function connectAsAdmin(): Promise<Client> {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT
      ? Number(process.env.DATABASE_PORT)
      : undefined,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_ADMIN_USER,
    password: process.env.DATABASE_ADMIN_PASSWORD,
  });
  await client.connect();
  return client;
}
