import { join } from 'node:path';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

/**
 * Where `global-setup` writes the connection of the ephemeral container.
 *
 * A file rather than a global, because Jest runs setup once in the main process
 * and the specs in a worker: nothing set on `globalThis` by the first survives
 * into the second. The file is read again in every worker.
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
