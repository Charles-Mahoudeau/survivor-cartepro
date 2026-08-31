import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './data-source';

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
        // Entities reach the connection through `TypeOrmModule.forFeature()`
        // rather than through the source globs, which resolve to nothing once
        // the app is bundled into a single file.
        autoLoadEntities: true,
        // Pending migrations are applied on boot, so pulling a branch that adds
        // one and starting the app is enough to be on its schema.
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
