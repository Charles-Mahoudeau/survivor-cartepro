import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { getMigrations } from 'better-auth/db/migration';
import { authOptions } from '@/config/auth/auth';

/**
 * Applies the pending Better Auth schema at boot, the way `migrationsRun: true`
 * applies the pending TypeORM ones.
 *
 * The two migrators share a database and ignore each other: TypeORM only emits
 * DDL for entities it declares, and these five tables are declared nowhere in
 * `src`. What they share is the promise the repository already makes — pull a
 * branch, start the server, be on its schema — and that promise is why this
 * runs here rather than in a script a teammate has to know about.
 *
 * `getMigrations` refuses to add a required column with no default to a
 * populated table, throwing rather than half-applying. Letting that throw fail
 * the boot is deliberate: a schema applied halfway is worse than a process that
 * will not start.
 */
@Injectable()
export class AuthMigrationService implements OnModuleInit {
  private readonly logger = new Logger(AuthMigrationService.name);

  async onModuleInit(): Promise<void> {
    const { toBeCreated, toBeAdded, runMigrations } =
      await getMigrations(authOptions);

    if (toBeCreated.length === 0 && toBeAdded.length === 0) {
      this.logger.log('Authentication schema up to date');
      return;
    }

    await runMigrations();

    const created = toBeCreated.map(({ table }) => table);
    const altered = toBeAdded.map(({ table }) => table);
    this.logger.log(
      `Authentication schema applied — created: ${created.join(', ') || 'none'}; altered: ${altered.join(', ') || 'none'}`,
    );
  }
}
