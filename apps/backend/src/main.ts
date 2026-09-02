import {
  ClassSerializerInterceptor,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { buildOpenApiDocument } from './swagger';

/**
 * Composition root.
 *
 * Helmet runs with CSP off and everything else it ships on (HSTS, nosniff,
 * frameguard, referrer policy). /docs renders its UI from a CDN, which a
 * default `script-src 'self'` breaks, and the rest of the API answers JSON
 * where CSP is not the control that matters.
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

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'docs', method: RequestMethod.ALL },
      { path: 'health', method: RequestMethod.GET },
    ],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const document = buildOpenApiDocument(app);

  SwaggerModule.setup('docs', app, document, {
    ui: false,
    raw: ['json'],
    jsonDocumentUrl: 'docs/json',
  });

  app.use(
    '/docs',
    apiReference({
      content: document,
      authentication: { preferredSecurityScheme: 'bearer' },
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
