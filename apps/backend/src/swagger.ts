import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { auth } from './config/auth/auth';
import { AUTH_BASE_PATH } from './config/auth/auth.constants';

/**
 * The OpenAPI description of this API, built from the controller decorators so
 * it cannot drift from the routes it documents.
 *
 * The authentication routes are not among those decorators: they are served by
 * middleware mounted before the Nest router, so `createDocument` cannot see
 * them. Their schema is folded in from the library's own OpenAPI plugin, which
 * derives it from the same configuration that serves them — /docs stays the
 * whole contract, which is what the brief asks to deliver.
 */
export async function buildOpenApiDocument(
  app: INestApplication,
): Promise<OpenAPIObject> {
  const config = new DocumentBuilder()
    .setTitle('CartePro API')
    .setDescription(
      'API du dispositif CartePro — avantages salariés dématérialisés. ' +
        'Trois espaces : salarié, partenaire, administration.',
    )
    .setVersion('0.1.0')
    .addCookieAuth('better-auth.session_token', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Session cookie, posée par /auth/sign-in/email',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  return mergeAuthRoutes(document);
}

/**
 * Folds the Better Auth paths into a Nest document, under the prefix the
 * handler is actually mounted at.
 *
 * A failure here is swallowed on purpose: an unreachable schema is a
 * documentation gap, not a reason to refuse to boot the API.
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
    // Both libraries describe the same OpenAPI JSON with their own types, and
    // they disagree on optionality — `parameters[].name` is optional in one and
    // required in the other. The value is the document either way.
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
