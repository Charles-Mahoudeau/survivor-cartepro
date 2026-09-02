import { existsSync, readFileSync } from 'node:fs';
import { CONN_FILE, type TestConnection } from './container-registry';

/**
 * Runs in every worker, BEFORE the spec file is required — which is the whole
 * point of the file.
 *
 * `src/config/auth/auth.ts` builds its connection pool and reads NODE_ENV at
 * module scope, so anything set after the first import of that module is set
 * too late: the pool would point at the developer's database and the library
 * would have captured an empty environment. Setting the variables here is what
 * makes the import that follows see the container.
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

// Boot-time validation (`env.schema.ts`) refuses to start without these, and
// the values are the ones the assertions rely on: the secret only has to be
// long enough, the origin is what the CSRF check compares against.
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ?? 'integration-secret-at-least-32-characters';
process.env.BETTER_AUTH_URL = 'http://localhost:3001';
process.env.AUTH_TRUSTED_ORIGINS = 'http://localhost:3000';
