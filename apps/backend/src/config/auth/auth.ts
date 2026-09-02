// FIRST: see the note in `main.ts`. Better Auth captures NODE_ENV when its
// module loads, so the environment has to exist before the import below.
import '../env/load-env';
import { apiKey } from '@better-auth/api-key';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import { openAPI } from 'better-auth/plugins';
import { Pool } from 'pg';
import {
  ADMIN_ROLES,
  AUTH_BASE_PATH,
  BANNED_USER_MESSAGE,
  MIN_PASSWORD_LENGTH,
  parseTrustedOrigins,
  ROLES,
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
  SIGN_IN_RATE_LIMIT,
} from './auth.constants';
import {
  AUTH_ADMIN_SCHEMA,
  AUTH_API_KEY_SCHEMA,
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
    /**
     * Explicit rather than left to the default, which is "on in production".
     * That default is read from the NODE_ENV the library captures once at load,
     * so an environment that arrives late turns the limiter off without a word
     * — and this is a security control, not a convenience. On everywhere means
     * the behaviour under test is the behaviour deployed.
     */
    enabled: true,
    storage: 'database',
    modelName: AUTH_RATE_LIMIT_MODEL_NAME,
    fields: AUTH_MODEL_FIELDS.rateLimit,
    customRules: {
      '/sign-in/email': SIGN_IN_RATE_LIMIT,
    },
  },

  advanced: {
    /**
     * Pinned, not left to the default. The library computes it as
     * `disableOriginCheck ?? isTest()`, so `NODE_ENV=test` — or a stray `TEST`
     * variable, which `isTest()` also honours — turns the CSRF origin check off
     * without a word. That is a security control disappearing on an
     * environment name, and it also makes any test that claims to cover it
     * vacuous: the assertion passes because nothing is checked.
     */
    disableOriginCheck: false,
    database: { generateId: false },
  },

  telemetry: { enabled: false },

  plugins: [
    admin({
      defaultRole: ROLES.EMPLOYEE,
      adminRoles: [...ADMIN_ROLES],
      bannedUserMessage: BANNED_USER_MESSAGE,
      schema: AUTH_ADMIN_SCHEMA,
    }),
    /**
     * Keys for the third-party surface the brief asks for (§3.3, an HR system
     * reading a balance). No route consumes them yet — the plugin is enabled
     * here so the table exists in the same migration as the rest of
     * authentication, rather than arriving alone later.
     */
    apiKey({ schema: AUTH_API_KEY_SCHEMA }),
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
