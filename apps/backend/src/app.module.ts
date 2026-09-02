import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './config/env/env.schema';
import { DatabaseModule } from './config/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { PartnersModule } from '@/modules/partners/partners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
    }),
    DatabaseModule,
    HealthModule,
    PartnersModule,
  ],
})
export class AppModule {}
