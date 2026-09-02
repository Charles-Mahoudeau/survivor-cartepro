import { join } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import '../env/load-env';
import { SnakeNamingStrategy } from './snake-naming.strategy';

const cwd = process.cwd();

/**
 * Globs resolved against the source tree. They are what the TypeORM CLI reads,
 * since no Nest container is running when `migration:generate` diffs the
 * entities against the live schema. The application itself relies on
 * `autoLoadEntities` instead — a bundled `dist/main.js` has no files left for a
 * glob to find.
 */
const entitiesGlob = join(cwd, 'src', '**', '*.entity.ts');
const viewsGlob = join(cwd, 'src', '**', '*.view.ts');
const migrationsGlob = join(cwd, 'database', 'migrations', '*.{ts,js}');

/**
 * The single description of how this API talks to Postgres, shared by the Nest
 * module and by the CLI so the two can never drift.
 *
 * `synchronize` is absent on purpose, which leaves it at TypeORM's `false`.
 * The brief requires validated transactions to be immutable, and a synchronize
 * pass is precisely what can rewrite the table holding them. Schema changes go
 * through migrations only.
 */
export function buildDataSourceOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DATABASE_HOST || 'localhost',
    port: parseInt(env.DATABASE_PORT || '5432', 10),
    username: env.DATABASE_USER || 'cartepro',
    password: env.DATABASE_PASSWORD || 'cartepro',
    database: env.DATABASE_NAME || 'cartepro',
    entities: [entitiesGlob, viewsGlob],
    migrations: [migrationsGlob],
    logging: env.DATABASE_LOGGING !== 'false',
    namingStrategy: new SnakeNamingStrategy(),
  };
}

/**
 * Default export consumed by the TypeORM CLI (`typeorm -d <this file>`).
 * `migrationsRun` is forced off here: the CLI's job is to generate, show and
 * revert migrations on demand, never to apply them as a side effect of being
 * pointed at a database.
 */
const dataSource = new DataSource({
  ...buildDataSourceOptions(),
  migrationsRun: false,
});

export default dataSource;
