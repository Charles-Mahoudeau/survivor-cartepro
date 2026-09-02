// FIRST, before anything else is evaluated. Better Auth reads NODE_ENV once,
// when its module loads, and that single read decides whether cookies are
// Secure and whether an unproxied request gets an IP. A module imported above
// this line would capture an empty environment.
import './config/env/load-env';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

/**
 * Composition root.
 *
 * It creates the application, hands it to `configureApp` — which is also what
 * the integration suite calls, so the middleware order under test is the one
 * that runs — and listens.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await configureApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const host = configService.get<string>('HOST') ?? '0.0.0.0';

  await app.listen(port, host);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
