import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './config/env/env.schema';
import { AuthModule } from './config/auth/auth.module';
import { DatabaseModule } from './config/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    HealthModule,
  ],
})
export class AppModule {}
