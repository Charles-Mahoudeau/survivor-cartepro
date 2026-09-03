import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { auth } from './config/auth/auth';
import { AUTH_BASE_PATH } from './config/auth/auth.constants';

/**
 * The OpenAPI description of this API, built from the controller decorators so
 * it cannot drift from the routes it documents.
 *
 * The authentication routes have none — they are served by middleware mounted
 * before the Nest router — so their schema is folded in from the library's own
 * OpenAPI plugin, and /docs stays the whole contract.
 */
export async function buildOpenApiDocument(
  app: INestApplication,
): Promise<OpenAPIObject> {
  const config = new DocumentBuilder()
    .setTitle('Ticket Tout API')
    .setDescription(
      'API du dispositif Ticket Tout — avantages salariés dématérialisés. ' +
        'Trois espaces : salarié, partenaire, administration.',
    )
    .setVersion('0.1.0')
    .addCookieAuth('better-auth.session_token', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Session cookie, posée par /auth/sign-in/email',
    })
    .build();

  return mergeAuthRoutes(SwaggerModule.createDocument(app, config));
}

/**
 * Folds the Better Auth paths in under the prefix the handler is mounted at.
 *
 * The cast is unavoidable: both libraries describe the same OpenAPI JSON with
 * their own types and disagree on optionality. A failure is swallowed on
 * purpose — an unreachable schema is a documentation gap, not a reason to
 * refuse to boot.
 */
async function mergeAuthRoutes(
  document: OpenAPIObject,
): Promise<OpenAPIObject> {
  let authSchema: Awaited<ReturnType<typeof auth.api.generateOpenAPISchema>>;

  try {
    authSchema = await auth.api.generateOpenAPISchema();
  } catch {
    return document;
  }

  for (const [path, operations] of Object.entries(authSchema.paths ?? {})) {
    document.paths[`${AUTH_BASE_PATH}${path}`] =
      operations as unknown as OpenAPIObject['paths'][string];
  }

  document.components = {
    ...document.components,
    schemas: {
      ...document.components?.schemas,
      ...authSchema.components?.schemas,
    },
  };

  return document;
}
