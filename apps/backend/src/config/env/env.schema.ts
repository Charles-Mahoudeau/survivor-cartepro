import { z } from 'zod';

/**
 * Every environment variable the API reads, validated at boot, so a missing or
 * malformed value fails the process here rather than surfacing as a confusing
 * runtime error later.
 *
 * There is no `DB_SYNC`. Validated transactions must stay immutable, and a
 * schema synchronize pass is what could rewrite the table holding them, so
 * schema changes go through migrations with no environment escape hatch.
 */
export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  DATABASE_HOST: z.string().min(1).trim().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  /** The restricted, non-superuser role the running app connects as — never the schema owner. */
  DATABASE_USER: z.string().min(1).default('cartepro_app'),
  DATABASE_PASSWORD: z.string().min(1).default('cartepro_app'),
  DATABASE_NAME: z.string().min(1).default('cartepro'),
  DATABASE_LOGGING: z.enum(['true', 'false']).default('true'),

  /** Thirty-two is the library's floor; a short value fails at boot, not later. */
  BETTER_AUTH_SECRET: z.string().min(32),

  /** The URL clients actually reach — not `0.0.0.0`. Its origin is trusted. */
  BETTER_AUTH_URL: z.url(),

  /** Comma-separated. Empty means nobody can sign in from a browser. */
  AUTH_TRUSTED_ORIGINS: z.string().min(1),

  /** Signs and verifies self-contained payment tokens; a short value fails at boot, not later. */
  PAYMENT_TOKEN_SIGNING_SECRET: z.string().min(32),

  /** Requested QR lifetime, in seconds. The token service still hard-caps issued tokens at 300s regardless of this setting. */
  PAYMENT_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .max(1800)
    .default(300),

  /**
   * Signs the audit log's JSON export, so its integrity can be checked with
   * the exported file and this key alone — no database, no PKI. A short
   * value fails at boot, not later.
   */
  AUDIT_EXPORT_SIGNING_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof EnvSchema>;
