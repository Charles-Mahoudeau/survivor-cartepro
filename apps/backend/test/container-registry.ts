import { join } from 'node:path';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

/**
 * Where `global-setup` writes the connection. A file and not a global: setup
 * runs in the main process, the specs in a worker, and nothing on `globalThis`
 * survives between the two.
 */
export const CONN_FILE = join(process.cwd(), '.testcontainer.json');

export interface TestConnection {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

let container: StartedPostgreSqlContainer | undefined;

/** Kept in the main process only, for `global-teardown` to stop it. */
export function setContainer(started: StartedPostgreSqlContainer): void {
  container = started;
}

export function getContainer(): StartedPostgreSqlContainer | undefined {
  return container;
}
