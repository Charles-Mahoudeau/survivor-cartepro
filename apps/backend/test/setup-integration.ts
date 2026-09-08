import { existsSync, readFileSync } from 'node:fs';
import { CONN_FILE, type TestConnection } from './container-registry';

/**
 * Runs in every worker BEFORE the spec is required, which is the whole point:
 * `auth.ts` builds its pool and reads NODE_ENV at module scope, so anything set
 * later is set too late.
 *
 * The secret only has to be long enough; the origin is what the CSRF check
 * compares against.
 */
if (!existsSync(CONN_FILE)) {
  throw new Error(
    `[integration] ${CONN_FILE} is missing — run the suite with ` +
      `"bun run test:integration", whose globalSetup starts the container and ` +
      `writes the connection.`,
  );
}

const conn = JSON.parse(readFileSync(CONN_FILE, 'utf8')) as TestConnection;

process.env.NODE_ENV = 'test';
process.env.DATABASE_HOST = conn.host;
process.env.DATABASE_PORT = String(conn.port);
process.env.DATABASE_USER = conn.username;
process.env.DATABASE_PASSWORD = conn.password;
process.env.DATABASE_NAME = conn.database;
process.env.DATABASE_LOGGING = 'false';

process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ?? 'integration-secret-at-least-32-characters';
process.env.BETTER_AUTH_URL = 'http://localhost:3001';
process.env.AUTH_TRUSTED_ORIGINS = 'http://localhost:3000';

process.env.PAYMENT_TOKEN_SIGNING_SECRET =
  process.env.PAYMENT_TOKEN_SIGNING_SECRET ??
  'integration-payment-token-secret-at-least-32-chars';

process.env.AUDIT_EXPORT_SIGNING_SECRET =
  process.env.AUDIT_EXPORT_SIGNING_SECRET ??
  'integration-audit-export-secret-at-least-32-chars';
