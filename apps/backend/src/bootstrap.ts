import {
  ClassSerializerInterceptor,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import type { Express, NextFunction, Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { auth, trustedOrigins } from './config/auth/auth';
import { AUTH_BASE_PATH } from './config/auth/auth.constants';
import { buildOpenApiDocument } from './swagger';

/** Nest routes answer under this prefix; `/auth` and `/health` are outside it. */
export const API_PREFIX = 'api';

/** URI versioning, so `/api/v1/...` is what a client calls. */
export const API_DEFAULT_VERSION = '1';

/**
 * Which senders of `x-forwarded-for` are believed. The delivered artifact puts
 * Traefik in front of the backend on a Docker bridge network, so the private
 * ranges — `uniquelocal` — are exactly the proxy.
 *
 * An address and not a hop count: a count trusts whoever opened the connection,
 * which hands a direct caller the header back. Loopback is deliberately absent,
 * so a client reaching this process directly cannot claim an address.
 */
export const TRUSTED_PROXIES = 'uniquelocal';

/**
 * Everything an application instance needs beyond its modules. The integration
 * suite calls it too, so the middleware order under test is the deployed one.
 *
 * The order below is load-bearing. CORS comes before the auth mount because the
 * handler answers everything under its prefix and knows nothing about OPTIONS:
 * a preflight reaching it gets a 404, and the browser never sends the sign-in
 * that follows.
 *
 * Better Auth is then plain middleware, before anything Nest registers — so its
 * routes cross neither the validation pipe, nor the serializer, nor the request
 * log, and Nest can own no route below `/auth`. The global prefix is a Nest
 * concern only, which is why `/auth` stays where the client expects it.
 *
 * ClassSerializerInterceptor is what makes `@Exclude()` on an entity actually
 * remove the property from a response, so it is registered before the first
 * entity exists.
 *
 * Helmet runs with CSP off: /docs renders its UI from a CDN, and the rest of
 * the API answers JSON where CSP is not the control that matters.
 *
 * The OpenAPI document is built last, once the prefix and the version are set,
 * or it would describe paths nobody can call.
 *
 * `withDocs` is off in tests, where building the OpenAPI document costs a full
 * introspection pass and no assertion reads it.
 */
export async function configureApp(
  app: INestApplication,
  { withDocs = true }: { withDocs?: boolean } = {},
): Promise<void> {
  const reflector = app.get(Reflector);

  const httpServer = app.getHttpAdapter().getInstance() as Express;
  httpServer.set('trust proxy', TRUSTED_PROXIES);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({ origin: trustedOrigins(), credentials: true });
  app.use(AUTH_BASE_PATH, resolveClientAddress, toNodeHandler(auth));

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

  app.setGlobalPrefix(API_PREFIX, {
    exclude: [
      { path: 'docs', method: RequestMethod.ALL },
      { path: 'health', method: RequestMethod.GET },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });

  if (!withDocs) {
    return;
  }

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

/**
 * Replaces `x-forwarded-for` with the address Express resolved.
 *
 * The auth handler is built from headers alone — it never sees the socket — so
 * it reads that header, and with no trusted-proxy list it believes whatever a
 * single-value one says. Rate limiting keys on the result, so a client rotating
 * the header gets a fresh bucket per request and the sign-in limit never fires.
 *
 * `req.ip` is the socket address while Express trusts no proxy, and the real
 * client address once `trust proxy` is configured for the reverse proxy in
 * front. Overwriting rather than appending is the point: whatever the client
 * sent is discarded.
 */
function resolveClientAddress(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.ip) {
    req.headers['x-forwarded-for'] = req.ip;
  } else {
    delete req.headers['x-forwarded-for'];
  }
  next();
}
