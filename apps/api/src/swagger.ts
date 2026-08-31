import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

/**
 * The OpenAPI description of this API. Built here rather than inline in
 * `main.ts` so the document can also be produced without booting an HTTP
 * listener — `scripts/generate-openapi.ts` writes it to disk from the same
 * definition, which is what keeps the committed contract and the running server
 * from drifting.
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('CartePro API')
    .setDescription(
      'API du dispositif CartePro — avantages salariés dématérialisés. ' +
        'Trois espaces : salarié, partenaire, administration.',
    )
    .setVersion('0.1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Jeton de session',
    })
    .build();

  return SwaggerModule.createDocument(app, config);
}
