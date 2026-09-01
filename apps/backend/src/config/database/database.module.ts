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
          DATABASE_HOST: configService.get<string>('DATABASE_HOST'),
          DATABASE_PORT: String(configService.get<number>('DATABASE_PORT')),
          DATABASE_USERNAME: configService.get<string>('DATABASE_USER'),
          DATABASE_PASSWORD: configService.get<string>('DATABASE_PASSWORD'),
          DATABASE_NAME: configService.get<string>('DATABASE_NAME'),
          DATABASE_LOGGING: configService.get<string>('DATABASE_LOGGING'),
        }),
        autoLoadEntities: true,
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
