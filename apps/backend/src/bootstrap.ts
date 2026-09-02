import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { auth, trustedOrigins } from './config/auth/auth';
import { AUTH_BASE_PATH } from './config/auth/auth.constants';
import { buildOpenApiDocument } from './swagger';

/**
 * Everything an application instance needs beyond its modules.
 *
 * It lives here rather than inside `bootstrap()` so the integration suite can
 * build the same application the process serves. A test that reassembled this
 * list by hand would be testing its own assembly: the middleware order below is
 * itself load-bearing, and getting it wrong is precisely the class of defect
 * these tests exist to catch.
 *
 * Helmet runs with CSP off and everything else it ships on (HSTS, nosniff,
 * frameguard, referrer policy). /docs renders its UI from a CDN, which a
 * default `script-src 'self'` breaks, and the rest of the API answers JSON
 * where CSP is not the control that matters.
 *
 * CORS is enabled BEFORE the auth handler is mounted, and the order matters:
 * the handler answers everything under its prefix and knows nothing about
 * OPTIONS, so a preflight reaching it gets a 404 and the browser never sends
 * the sign-in that follows.
 *
 * Better Auth is then mounted as plain middleware, before anything Nest
 * registers. Two consequences worth knowing before adding anything global: the
 * handler answers EVERY request under its prefix, unknown paths included, so
 * Nest can own no route below /auth; and those routes cross neither the
 * validation pipe, nor the serializer, nor the request log.
 *
 * ClassSerializerInterceptor is what makes `@Exclude()` on an entity actually
 * remove the property from a response. It is registered before the first entity
 * exists, so no handler is ever written against a serializer that is not there
 * — a password hash reaching a client is a one-line mistake otherwise.
 *
 * `withDocs` is off in tests: building the OpenAPI document costs a full
 * introspection pass per application, and no assertion reads it.
 */
export async function configureApp(
  app: INestApplication,
  { withDocs = true }: { withDocs?: boolean } = {},
): Promise<void> {
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

  if (!withDocs) {
    return;
  }

  /**
   * The OpenAPI contract is served by Nest itself: `raw` publishes it on
   * /docs/json while `ui: false` keeps the bundled Swagger UI out of the way,
   * leaving the rendered documentation to Scalar.
   */
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
}
