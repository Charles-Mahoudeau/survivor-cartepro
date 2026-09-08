// FIRST: Better Auth captures NODE_ENV when its module loads, so the
// environment has to exist before the import below.
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
import { getAuthProvisioning } from './auth-provisioning';
import { handleUserCreated } from './user-created.handler';

/**
 * Origins allowed to carry a session cookie. The same list feeds CORS in the
 * composition root: two lists that drift produce a refusal whose cause is
 * invisible client-side.
 */
export function trustedOrigins(): string[] {
  return parseTrustedOrigins(process.env.AUTH_TRUSTED_ORIGINS);
}

/**
 * The single Better Auth instance.
 *
 * It reads `process.env` directly, like `data-source.ts`: the promotion script
 * loads this file with no Nest container running.
 *
 * The pool is its own — the library talks to Postgres through Kysely and cannot
 * borrow TypeORM's. Same database, same six tables: the schema is ours, and the
 * library is told where our columns are.
 *
 * `generateId: false` leaves ids to the database, so a row gets the `uuidv7()`
 * default every other row of this schema gets.
 *
 * No `cookieCache`: it would keep a revoked session and a stale role alive
 * until it expired, and this plugin set exists to ban accounts and change roles.
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
   * Every account needs a wallet. This runs after Better Auth's own
   * transaction has already committed the user (see `user-created.handler.ts`
   * for why), so a failure here removes the account rather than leaving one
   * that can sign in with no wallet.
   */
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          const { walletService, userService } = getAuthProvisioning();
          await handleUserCreated(user.id, {
            createWallet: (id) => walletService.createDefault(id),
            deleteUser: (id) => userService.remove(id),
          });
        },
      },
    },
  },

  /**
   * `enabled` is pinned rather than left to the library, which derives it from
   * the NODE_ENV it captured once — a security control that switches off on an
   * environment name is not one. Counted in the database, since a process-local
   * counter resets on every deployment.
   */
  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: AUTH_RATE_LIMIT_MODEL_NAME,
    fields: AUTH_MODEL_FIELDS.rateLimit,
    customRules: { '/sign-in/email': SIGN_IN_RATE_LIMIT },
  },

  /**
   * `disableOriginCheck` is pinned for the same reason: the library computes it
   * as `disableOriginCheck ?? isTest()`, so `NODE_ENV=test` — or a stray `TEST`
   * variable — turns the CSRF origin check off without a word.
   */
  advanced: {
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
    /** For the third-party surface of §3.3. No route consumes a key yet. */
    apiKey({ schema: AUTH_API_KEY_SCHEMA }),
    /** Publishes the schema `swagger.ts` folds into the Nest document. */
    openAPI({ disableDefaultReference: true }),
  ],
} as const satisfies Parameters<typeof betterAuth>[0];

/** Shared by the HTTP handler and the guards. */
export const auth = betterAuth(authOptions);

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession['user'];
