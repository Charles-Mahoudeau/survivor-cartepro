import { join } from 'node:path';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

/**
 * Where `global-setup` writes the connection. A file and not a global: setup
 * runs in the main process, the specs in a worker, and nothing on `globalThis`
 * survives between the two.
 */
export const CONN_FILE = join(process.cwd(), '.testcontainer.json');

export interface RoleCredentials {
  username: string;
  password: string;
}

/**
 * Two roles, mirroring the real deployment split (see
 * `ensure-application-role.ts`): `admin` is the container's own bootstrap
 * superuser, used only for migrations and for anything a spec needs a
 * genuinely privileged connection for. `app` is what every spec's
 * `context.dataSource` actually connects as — restricted, exactly like the
 * running application in dev and prod.
 */
export interface TestConnection {
  host: string;
  port: number;
  database: string;
  admin: RoleCredentials;
  app: RoleCredentials;
}

let container: StartedPostgreSqlContainer | undefined;

/** Kept in the main process only, for `global-teardown` to stop it. */
export function setContainer(started: StartedPostgreSqlContainer): void {
  container = started;
}

export function getContainer(): StartedPostgreSqlContainer | undefined {
  return container;
}
