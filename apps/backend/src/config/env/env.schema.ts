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
  DATABASE_USER: z.string().min(1).default('cartepro'),
  DATABASE_PASSWORD: z.string().min(1).default('cartepro'),
  DATABASE_NAME: z.string().min(1).default('cartepro'),
  DATABASE_LOGGING: z.enum(['true', 'false']).default('true'),

  /**
   * Signs session cookies and every token Better Auth mints. Thirty-two
   * characters is the library's own floor, restated here so a short value fails
   * at boot rather than as a warning nobody reads.
   */
  BETTER_AUTH_SECRET: z.string().min(32),

  /**
   * Public URL of this API. Better Auth builds callback URLs from it and trusts
   * its origin, so it must be the URL clients actually reach — not `0.0.0.0`.
   */
  BETTER_AUTH_URL: z.url(),

  /**
   * Origins allowed to carry a session cookie, comma-separated. The frontend
   * runs on its own port, so it is a different origin even in development, and
   * an empty list means nothing can sign in from a browser.
   */
  AUTH_TRUSTED_ORIGINS: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
