import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import {
  CONN_FILE,
  setContainer,
  type TestConnection,
} from './container-registry';

/**
 * Postgres 18, not "some Postgres": every primary key defaults to `uuidv7()`, a
 * builtin that arrived in 18, so an older image fails on the first table rather
 * than running the suite on a version the schema does not support.
 */
const IMAGE = 'postgres:18-alpine';

/**
 * Runs once before the suite: starts an ephemeral Postgres, applies the real
 * migrations with the real script, and writes the connection for the workers.
 *
 * Never the developer's database — a suite that truncates between tests has no
 * business pointing at anything someone might have data in.
 *
 * Migration output is captured rather than inherited, and re-emitted only when
 * it fails.
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
