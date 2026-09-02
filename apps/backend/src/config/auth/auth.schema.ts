import { snakeCase } from '../database/snake-naming.strategy';

/**
 * Tells Better Auth where our columns are.
 *
 * The schema belongs to this repository: the tables are declared as entities in
 * `src/modules/user/entities/`, created by our migrations, and named the way
 * every other table is — snake_case, through `SnakeNamingStrategy`. Better Auth
 * names its fields in camelCase, so it needs the mapping.
 *
 * The mapping is COMPUTED with the very function the naming strategy uses,
 * never typed out. A hand-written table would be a second description of the
 * same rule, and the day someone renames a column the two would disagree — here
 * they cannot, because there is only one implementation of "how a property name
 * becomes a column name".
 *
 * Only the field NAMES are listed, and only those that actually change under
 * the transformation: `email` or `token` map to themselves. A name listed here
 * that no longer exists costs nothing; a name missing from here fails loudly on
 * the first request that touches the column, never silently.
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
 * Field mappings for the columns the admin plugin adds.
 *
 * They are declared as entity columns like every other one — a column no entity
 * declares is a column `db:generate` would propose to drop on the next
 * migration.
 */
export const AUTH_ADMIN_SCHEMA = {
  user: { fields: columnsOf('banReason', 'banExpires') },
  session: { fields: columnsOf('impersonatedBy') },
} as const;

/**
 * The rate limit table is the one whose NAME changes too: `rateLimit` in the
 * library, `rate_limit` in a schema where every other table is snake_case.
 */
export const AUTH_RATE_LIMIT_MODEL_NAME = snakeCase('rateLimit');
