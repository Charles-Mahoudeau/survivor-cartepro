import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './config/env/env.schema';
import { DatabaseModule } from './config/database/database.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
    }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
