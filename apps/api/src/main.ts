import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { buildOpenApiDocument } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // CSP off, everything else helmet ships (HSTS, nosniff, frameguard, referrer
  // policy) on. /docs renders its UI from a CDN and a default `script-src
  // 'self'` breaks it; the rest of the API answers JSON, where CSP is not the
  // control that matters.
  app.use(helmet({ contentSecurityPolicy: false }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ClassSerializerInterceptor is what makes `@Exclude()` on an entity actually
  // remove the property from the response. Registered before the first entity
  // exists, so no handler is ever written against a serializer that is not
  // there — a password hash reaching a client is a one-line mistake otherwise.
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );

  const document = buildOpenApiDocument(app);

  // Nest serves the raw document itself. `ui: false` keeps its bundled Swagger
  // UI out of the way, leaving the rendered documentation to Scalar below,
  // while `raw` still publishes the contract on /docs/json.
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
