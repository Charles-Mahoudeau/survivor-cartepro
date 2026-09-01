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
  POSTGRES_HOST: z.string().min(1).trim().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().min(1).default('cartepro'),
  POSTGRES_PASSWORD: z.string().min(1).default('cartepro'),
  POSTGRES_DB: z.string().min(1).default('cartepro'),
  POSTGRES_LOGGING: z.enum(['true', 'false']).default('true'),
});

export type Env = z.infer<typeof EnvSchema>;
