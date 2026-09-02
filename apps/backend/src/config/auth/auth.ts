// FIRST: see the note in `main.ts`. Better Auth captures NODE_ENV when its
// module loads, so the environment has to exist before the import below.
import '../env/load-env';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import { openAPI } from 'better-auth/plugins';
import { Pool } from 'pg';
import {
  ADMIN_ROLES,
  AUTH_BASE_PATH,
  MIN_PASSWORD_LENGTH,
  parseTrustedOrigins,
  ROLES,
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from './auth.constants';
import {
  AUTH_ADMIN_SCHEMA,
  AUTH_MODEL_FIELDS,
  AUTH_RATE_LIMIT_MODEL_NAME,
} from './auth.schema';

/**
 * Origins allowed to carry a session cookie to this API. The same list feeds
 * CORS in the composition root: two lists that drift produce a refusal whose
 * cause is invisible client-side.
 */
export function trustedOrigins(): string[] {
  return parseTrustedOrigins(process.env.AUTH_TRUSTED_ORIGINS);
}

/**
 * The single Better Auth instance.
 *
 * It reads `process.env` directly rather than through `ConfigService`, for the
 * same reason `data-source.ts` does: the role script loads this file with no
 * Nest container running, so anything it needs must be readable without one.
 *
 * The connection is its own `pg.Pool`, separate from the one TypeORM holds:
 * Better Auth talks to Postgres through Kysely and cannot borrow a TypeORM
 * connection. It is the same database and the same five tables — the schema is
 * ours, declared in `src/modules/user/entities/` and migrated by
 * `db:generate`, and the library is told where our columns are.
 *
 * Ids are left to the database (`generateId: false`), so a row gets the same
 * `uuidv7()` default as every other row of this schema rather than a
 * library-generated string. That is what makes a foreign key from a business
 * table to `user.id` an ordinary `uuid` relation.
 *
 * There is no `cookieCache`. Caching the session in a signed cookie removes a
 * query per request, but it also keeps a revoked session and a stale role alive
 * until the cache expires — and this plugin set exists to ban accounts and to
 * change roles. One read per guarded request is the price of both taking effect
 * on the next one.
 */
export const authOptions = {
  appName: 'CartePro',
  basePath: AUTH_BASE_PATH,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: trustedOrigins(),

  database: new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'cartepro',
    password: process.env.DATABASE_PASSWORD || 'cartepro',
    database: process.env.DATABASE_NAME || 'cartepro',
  }),

  user: { fields: AUTH_MODEL_FIELDS.user },
  session: {
    fields: AUTH_MODEL_FIELDS.session,
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  account: { fields: AUTH_MODEL_FIELDS.account },
  verification: { fields: AUTH_MODEL_FIELDS.verification },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  },

  /**
   * Counted in the database rather than in memory: an in-process counter resets
   * on every restart, which on a deployment day hands an attacker a fresh
   * budget each time.
   */
  rateLimit: {
    storage: 'database',
    modelName: AUTH_RATE_LIMIT_MODEL_NAME,
    fields: AUTH_MODEL_FIELDS.rateLimit,
  },

  advanced: { database: { generateId: false } },

  telemetry: { enabled: false },

  plugins: [
    admin({
      defaultRole: ROLES.USER,
      adminRoles: [...ADMIN_ROLES],
      schema: AUTH_ADMIN_SCHEMA,
    }),
    /**
     * Publishes the schema of the routes below `/auth`, which `swagger.ts`
     * merges into the document Nest builds. Its own Scalar page is off: this
     * API renders one documentation page, not two.
     */
    openAPI({ disableDefaultReference: true }),
  ],
} as const satisfies Parameters<typeof betterAuth>[0];

/** The single Better Auth instance, shared by the HTTP handler and the guards. */
export const auth = betterAuth(authOptions);

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession['user'];
