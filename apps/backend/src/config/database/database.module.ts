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
 * Pending migrations are applied on boot, so pulling a branch that adds one and
 * starting the app is enough to be on its schema.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...buildDataSourceOptions({
          DB_HOST: configService.get<string>('DB_HOST'),
          DB_PORT: String(configService.get<number>('DB_PORT')),
          DB_USERNAME: configService.get<string>('DB_USERNAME'),
          DB_PASSWORD: configService.get<string>('DB_PASSWORD'),
          DB_DATABASE: configService.get<string>('DB_DATABASE'),
          DB_LOGGING: configService.get<string>('DB_LOGGING'),
        }),
        autoLoadEntities: true,
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
