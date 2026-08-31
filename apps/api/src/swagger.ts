import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

/**
 * The OpenAPI description of this API, built from the controller decorators so
 * it cannot drift from the routes it documents.
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
