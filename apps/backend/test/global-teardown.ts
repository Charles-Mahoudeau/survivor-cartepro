import { rmSync } from 'node:fs';
import { CONN_FILE, getContainer } from './container-registry';

/** Stops the ephemeral container and removes the connection file. */
export default async function globalTeardown(): Promise<void> {
  await getContainer()?.stop();
  rmSync(CONN_FILE, { force: true });
}
