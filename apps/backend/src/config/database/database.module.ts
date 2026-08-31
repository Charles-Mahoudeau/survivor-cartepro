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
          POSTGRES_HOST: configService.get<string>('POSTGRES_HOST'),
          POSTGRES_PORT: String(configService.get<number>('POSTGRES_PORT')),
          POSTGRES_USERNAME: configService.get<string>('POSTGRES_USER'),
          POSTGRES_PASSWORD: configService.get<string>('POSTGRES_PASSWORD'),
          POSTGRES_DATABASE: configService.get<string>('POSTGRES_DB'),
          POSTGRES_LOGGING: String(
            configService.get<boolean>('POSTGRES_LOGGING'),
          ),
        }),
        autoLoadEntities: true,
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
