import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import {
  CONN_FILE,
  setContainer,
  type TestConnection,
} from './container-registry';

/**
 * Postgres 18, not "some Postgres".
 *
 * Every primary key of this schema defaults to `uuidv7()`, a builtin that
 * arrived in 18. An older image would fail the migration on the first table —
 * which is the behaviour we want: the harness cannot silently run the suite on
 * a version the schema does not support.
 */
const IMAGE = 'postgres:18-alpine';

/**
 * Runs once, before the whole integration suite.
 *
 * Starts an ephemeral Postgres, applies the real migrations to it with the real
 * script, and writes the connection where every worker will read it. The
 * database is never the developer's: a suite that truncates tables between
 * tests has no business pointing at anything someone might have data in.
 */
export default async function globalSetup(): Promise<void> {
  console.log(`\n🐘 [integration] starting ${IMAGE}...`);

  const container = await new PostgreSqlContainer(IMAGE)
    .withDatabase('cartepro_test')
    .withUsername('cartepro')
    .withPassword('cartepro')
    .start();

  const conn: TestConnection = {
    host: container.getHost(),
    port: container.getPort(),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
  };

  console.log('🐘 [integration] applying migrations...');
  try {
    // Output captured rather than inherited: the migration detail is noise when
    // it works, and the only time it is worth reading is when it does not.
    execFileSync('bun', ['scripts/db-migrate.ts'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        DATABASE_HOST: conn.host,
        DATABASE_PORT: String(conn.port),
        DATABASE_USER: conn.username,
        DATABASE_PASSWORD: conn.password,
        DATABASE_NAME: conn.database,
        DATABASE_LOGGING: 'false',
      },
    });
  } catch (error) {
    const failure = error as { stdout?: Buffer; stderr?: Buffer };
    if (failure.stdout) process.stdout.write(failure.stdout);
    if (failure.stderr) process.stderr.write(failure.stderr);
    throw error;
  }

  writeFileSync(CONN_FILE, JSON.stringify(conn), 'utf8');
  setContainer(container);

  console.log(`🐘 [integration] ready on ${conn.host}:${conn.port}\n`);
}
