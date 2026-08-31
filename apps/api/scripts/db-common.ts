import chalk from 'chalk';
import 'dotenv/config';
import type { DataSource } from 'typeorm';

/**
 * The connection string as it may appear in a terminal: the password is never
 * part of it, so a screenshot of a migration run during a project review leaks
 * nothing.
 */
export function describeConnection(): string {
  const user = process.env.DB_USERNAME || 'cartepro';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_DATABASE || 'cartepro';
  return `${user}@${host}:${port}/${database}`;
}

/**
 * Opens the data source, retrying while Postgres finishes booting — `db:up`
 * returns as soon as the container is created, which is before it accepts
 * connections.
 */
export async function connect(
  dataSource: DataSource,
  maxRetries = 10,
  delayMs = 1000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      await dataSource.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(chalk.gray(`├─ Tentative ${attempt}/${maxRetries}...`));
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/** Prints a failure the same way everywhere, then exits non-zero. */
export async function fail(
  dataSource: DataSource | null,
  title: string,
  error: unknown,
): Promise<never> {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
  }
  console.log('');
  console.log(chalk.bold.red(title));
  console.log(
    chalk.red(`└─ ${error instanceof Error ? error.message : String(error)}`),
  );

  const message = error instanceof Error ? error.message : String(error);
  if (/connect|ECONNREFUSED|connection/i.test(message)) {
    console.log('');
    console.log(chalk.yellow('Conseil : la base est-elle démarrée ?'));
    console.log(chalk.gray('└─ ') + chalk.white('bun run db:up'));
  }
  console.log('');
  process.exit(1);
}
