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
 * The whole `AppModule` is wired, not a hand-picked subset: the guards are
 * registered as `APP_GUARD` by `AuthModule`, the entities by `UserModule`, and
 * a spec that assembled a smaller graph would be asserting on a composition
 * that never runs. `configureApp` is the same function `main.ts` calls, so the
 * middleware order under test is the deployed one.
 *
 * Documentation is skipped: building the OpenAPI document costs a full
 * introspection pass per application and no assertion reads it.
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

/**
 * Empties the tables. Call it in `beforeEach`, then build the fixtures the test
 * needs — see `db/truncate.ts` for why it is a truncation and not a rollback.
 */
export async function resetDatabase({ dataSource }: TestApp): Promise<void> {
  await truncateAll(dataSource);
}

/**
 * Closes both pools.
 *
 * `app.close()` releases TypeORM's. Better Auth holds a second one, built at
 * module scope from the environment, and nothing in the Nest lifecycle knows
 * about it — left open, Jest hangs after the last assertion with no failure to
 * point at.
 */
export async function closeTestApp({ app }: TestApp): Promise<void> {
  await app.close();
  await authOptions.database.end();
}
