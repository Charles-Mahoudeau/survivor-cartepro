import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './data-source';

/**
 * Wires the connection from validated configuration.
 *
 * `autoLoadEntities` is what registers entities here: they reach the connection
 * through `TypeOrmModule.forFeature()` rather than through the source globs,
 * which resolve to nothing once the app is bundled into a single file.
 *
 * `migrationsRun` is off: this connection is the restricted, non-superuser
 * application role, which owns no schema and cannot run migrations. They are
 * applied on boot, before this module ever connects — see `main.ts`'s
 * `prepareDatabase`, over a separate, short-lived admin connection.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...buildDataSourceOptions({
          DATABASE_HOST: configService.get<string>('DATABASE_HOST'),
          DATABASE_PORT: String(configService.get<number>('DATABASE_PORT')),
          DATABASE_USER: configService.get<string>('DATABASE_USER'),
          DATABASE_PASSWORD: configService.get<string>('DATABASE_PASSWORD'),
          DATABASE_NAME: configService.get<string>('DATABASE_NAME'),
          DATABASE_LOGGING: configService.get<string>('DATABASE_LOGGING'),
        }),
        // The source globs stay out of the running application: they resolve
        // to nothing in a bundle, so an entity that reaches the connection
        // through them here would be missing in production and in CI.
        entities: [],
        autoLoadEntities: true,
        migrationsRun: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
