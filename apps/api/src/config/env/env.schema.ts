import { z } from 'zod';

/**
 * Every environment variable the API reads, validated at boot. A missing or
 * malformed value fails the process here rather than surfacing as a confusing
 * runtime error later.
 *
 * Note what is absent: there is no `DB_SYNC`. The brief requires transaction
 * data to stay "intègre et non modifiable après validation", and a schema
 * synchronize pass is exactly the thing that can rewrite a table holding
 * validated transactions. Schema changes go through migrations, with no
 * environment escape hatch.
 */
export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  DB_HOST: z.string().min(1).trim().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string().min(1).default('cartepro'),
  DB_PASSWORD: z.string().min(1).default('cartepro'),
  DB_DATABASE: z.string().min(1).default('cartepro'),
  // Query logging is on by default so a dev sees the SQL its entities produce;
  // set to 'false' to silence it.
  DB_LOGGING: z.enum(['true', 'false']).default('true'),
});

export type Env = z.infer<typeof EnvSchema>;
