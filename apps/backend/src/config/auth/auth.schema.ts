import { snakeCase } from '../database/snake-naming.strategy';

/**
 * Tells Better Auth where our columns are.
 *
 * The schema belongs to this repository — entities in
 * `src/modules/user/entities/`, columns in `snake_case` — while the library
 * names its fields in camelCase. The mapping is COMPUTED with the very function
 * `SnakeNamingStrategy` uses, never typed out, so the two cannot disagree.
 *
 * Only the names the transformation changes are listed; `email` and `token` map
 * to themselves. A missing one fails on the first request that touches the
 * column, never silently.
 */
function columnsOf(...fields: string[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, snakeCase(field)]));
}

/** Field mappings for the four core models. */
export const AUTH_MODEL_FIELDS = {
  user: columnsOf('emailVerified', 'createdAt', 'updatedAt'),
  session: columnsOf(
    'expiresAt',
    'ipAddress',
    'userAgent',
    'userId',
    'createdAt',
    'updatedAt',
  ),
  account: columnsOf(
    'accountId',
    'providerId',
    'userId',
    'accessToken',
    'refreshToken',
    'idToken',
    'accessTokenExpiresAt',
    'refreshTokenExpiresAt',
    'createdAt',
    'updatedAt',
  ),
  verification: columnsOf('expiresAt', 'createdAt', 'updatedAt'),
  rateLimit: columnsOf('lastRequest'),
} as const;

/**
 * Columns the admin plugin adds. They are declared as entity columns like every
 * other one: a column no entity declares is one `db:generate` would drop.
 */
export const AUTH_ADMIN_SCHEMA = {
  user: { fields: columnsOf('banReason', 'banExpires') },
  session: { fields: columnsOf('impersonatedBy') },
} as const;

/** Columns of the API key plugin, table name included. */
export const AUTH_API_KEY_SCHEMA = {
  apikey: {
    modelName: snakeCase('apiKey'),
    fields: columnsOf(
      'configId',
      'referenceId',
      'refillInterval',
      'refillAmount',
      'lastRefillAt',
      'rateLimitEnabled',
      'rateLimitTimeWindow',
      'rateLimitMax',
      'requestCount',
      'lastRequest',
      'expiresAt',
      'createdAt',
      'updatedAt',
    ),
  },
} as const;

/** `rateLimit` in the library, `rate_limit` in a snake_case schema. */
export const AUTH_RATE_LIMIT_MODEL_NAME = snakeCase('rateLimit');
