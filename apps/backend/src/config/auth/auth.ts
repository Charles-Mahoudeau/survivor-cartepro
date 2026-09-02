import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import { openAPI } from 'better-auth/plugins';
import { Pool } from 'pg';
import '../env/load-env';
import {
  ADMIN_ROLES,
  AUTH_BASE_PATH,
  MIN_PASSWORD_LENGTH,
  parseTrustedOrigins,
  ROLES,
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from './auth.constants';

/**
 * Origins allowed to carry a session cookie to this API. The same list feeds
 * CORS in the composition root: two lists that drift produce a refusal whose
 * cause is invisible client-side.
 */
export function trustedOrigins(): string[] {
  return parseTrustedOrigins(process.env.AUTH_TRUSTED_ORIGINS);
}

/**
 * Everything Better Auth needs, kept separate from the instance because the
 * migration planner (`getMigrations`) takes the options, not the instance.
 *
 * It reads `process.env` directly rather than through `ConfigService`, for the
 * same reason `data-source.ts` does: the migration script and the promotion
 * script load this file with no Nest container running, so anything it needs
 * must be readable without one.
 *
 * The connection is its own `pg.Pool`, separate from the one TypeORM holds.
 * Better Auth talks to Postgres through Kysely and cannot borrow a TypeORM
 * connection; both pools point at the same database.
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

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
  },

  session: {
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },

  /**
   * Counted in the database rather than in memory: an in-process counter resets
   * on every restart, which on a deployment day hands an attacker a fresh
   * budget each time.
   */
  rateLimit: {
    storage: 'database',
  },

  telemetry: { enabled: false },

  plugins: [
    admin({
      defaultRole: ROLES.USER,
      adminRoles: [...ADMIN_ROLES],
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
