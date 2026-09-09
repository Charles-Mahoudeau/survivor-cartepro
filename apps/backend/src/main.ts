// FIRST: Better Auth reads NODE_ENV once, when its module loads, and that read
// decides whether cookies are Secure and whether a request gets an IP.
import './config/env/load-env';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import adminDataSource from './config/database/data-source';
import {
  ensureApplicationRoleExists,
  grantApplicationRolePrivileges,
} from './config/database/ensure-application-role';

/**
 * Applies pending migrations and keeps the restricted application role's
 * grants current, over a short-lived admin connection that closes before
 * the application's own — deliberately unprivileged — connection ever
 * opens. "Pull a branch that adds a migration and start the app" still
 * works with no extra deploy step; only which role performs the migration
 * changed.
 */
async function prepareDatabase() {
  await adminDataSource.initialize();
  // Before: a migration's own DCL (audit_log's REVOKE) targets this role by
  // name, so it has to exist before migrations run, not only once they do.
  await ensureApplicationRoleExists(adminDataSource);
  await adminDataSource.runMigrations({ transaction: 'all' });
  // After: covers whatever tables migrations just created.
  await grantApplicationRolePrivileges(adminDataSource);
  await adminDataSource.destroy();
}

/** Composition root. `configureApp` is what the integration suite calls too. */
async function bootstrap() {
  await prepareDatabase();

  const app = await NestFactory.create(AppModule);

  await configureApp(app);

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const host = configService.get<string>('HOST') ?? '0.0.0.0';

  await app.listen(port, host);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
