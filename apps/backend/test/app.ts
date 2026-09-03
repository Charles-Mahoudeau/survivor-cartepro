import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';
import { configureApp } from '@/bootstrap';
import { authOptions } from '@/config/auth/auth';
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
 */
export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: [ProbeController],
  }).compile();

  const app = moduleRef.createNestApplication();
  await configureApp(app, { withDocs: false });
  await app.init();

  return { app, dataSource: app.get(DataSource) };
}

/** Call it in `beforeEach`, then build the fixtures the test needs. */
export async function resetDatabase({ dataSource }: TestApp): Promise<void> {
  await truncateAll(dataSource);
}

/**
 * Closes both pools. `app.close()` releases TypeORM's; Better Auth holds a
 * second one no part of the Nest lifecycle knows about, and left open it hangs
 * Jest with no failure to point at.
 */
export async function closeTestApp({ app }: TestApp): Promise<void> {
  await app.close();
  await authOptions.database.end();
}
