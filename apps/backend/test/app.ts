import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';
import { configureApp } from '@/bootstrap';
import { ProbeController } from './probe.controller';
import { truncateAll } from './db/truncate';

export interface TestApp {
  app: INestApplication;
  dataSource: DataSource;
}

/**
 * Boots the real application against the ephemeral database.
 *
 * The whole `AppModule`, not a hand-picked subset: a spec that assembled a
 * smaller graph would assert on a composition that never runs. `configureApp`
 * is what `main.ts` calls, so the middleware order under test is the deployed
 * one.
 *
 * It LISTENS, on an ephemeral port, rather than only initialising. Supertest
 * calls `listen(0)` itself when handed a server that is not listening, and
 * closes it again after the response — once per request. Dozens of those cycles
 * in a file let the operating system hand back a port whose previous socket is
 * still finishing, so a late response lands on the next connection: a status
 * belonging to another request, or bytes that do not begin with `HTTP/`.
 * Listening once means supertest binds nothing and closes nothing.
 */
export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: [ProbeController],
  }).compile();

  const app = moduleRef.createNestApplication();
  await configureApp(app, { withDocs: false });
  await app.listen(0);

  return { app, dataSource: app.get(DataSource) };
}

/** Call it in `beforeEach`, then build the fixtures the test needs. */
export async function resetDatabase({ dataSource }: TestApp): Promise<void> {
  await truncateAll(dataSource);
}

/**
 * Closes both pools. `app.close()` runs the shutdown hooks, and `AuthConnection`
 * is the one that ends the pool Better Auth built — ending it here as well
 * would be a second `end()` on the same pool, which `pg` rejects.
 */
export async function closeTestApp({ app }: TestApp): Promise<void> {
  await app.close();
}
