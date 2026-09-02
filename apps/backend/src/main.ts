// FIRST, before anything else is evaluated. Better Auth reads NODE_ENV once,
// when its module loads, and that single read decides whether rate limiting is
// on, whether cookies are Secure, and whether an unproxied request gets an IP.
// A module imported above this line would capture an empty environment.
import './config/env/load-env';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { auth, trustedOrigins } from './config/auth/auth';
import { AUTH_BASE_PATH } from './config/auth/auth.constants';
import { buildOpenApiDocument } from './swagger';

/**
 * Composition root.
 *
 * Helmet runs with CSP off and everything else it ships on (HSTS, nosniff,
 * frameguard, referrer policy). /docs renders its UI from a CDN, which a
 * default `script-src 'self'` breaks, and the rest of the API answers JSON
 * where CSP is not the control that matters.
 *
 * Better Auth is mounted as plain middleware, right after helmet and before
 * anything Nest registers. Two consequences worth knowing before adding
 * anything global: the handler answers EVERY request under its prefix, unknown
 * paths included, so Nest can own no route below /auth; and those routes cross
 * neither the validation pipe, nor the serializer, nor the request log — the
 * library validates with its own schemas, and an authentication request is
 * never logged.
 *
 * CORS reads the same list as the auth trusted origins, and is enabled BEFORE
 * that mount. Order matters here: the auth handler answers everything under its
 * prefix and knows nothing about OPTIONS, so a preflight reaching it gets a 404
 * and the browser never sends the sign-in that follows. Behind the CORS
 * middleware, the preflight is answered before it gets there. The frontend runs
 * on its own port, so it is already a different origin in development, and two
 * lists that drift produce a refusal whose cause is invisible client-side.
 *
 * ClassSerializerInterceptor is what makes `@Exclude()` on an entity actually
 * remove the property from a response. It is registered before the first
 * entity exists, so no handler is ever written against a serializer that is
 * not there — a password hash reaching a client is a one-line mistake
 * otherwise.
 *
 * The OpenAPI contract is served by Nest itself: `raw` publishes it on
 * /docs/json while `ui: false` keeps the bundled Swagger UI out of the way,
 * leaving the rendered documentation to Scalar.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.use(helmet({ contentSecurityPolicy: false }));

  app.enableCors({ origin: trustedOrigins(), credentials: true });

  app.use(AUTH_BASE_PATH, toNodeHandler(auth));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );

  const document = await buildOpenApiDocument(app);

  SwaggerModule.setup('docs', app, document, {
    ui: false,
    raw: ['json'],
    jsonDocumentUrl: 'docs/json',
  });

  app.use(
    '/docs',
    apiReference({
      content: document,
      authentication: { preferredSecurityScheme: 'cookie' },
    }),
  );

  const port = configService.get<number>('PORT') ?? 3000;
  const host = configService.get<string>('HOST') ?? '0.0.0.0';

  await app.listen(port, host);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
