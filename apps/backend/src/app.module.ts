import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from '@/config/env/env.schema';
import { AuthModule } from '@/config/auth/auth.module';
import { DatabaseModule } from '@/config/database/database.module';
import { AllocationsModule } from '@/modules/allocations/allocations.module';
import { EmployersModule } from '@/modules/employers/employers.module';
import { HealthModule } from '@/modules/health/health.module';
import { PartnersModule } from '@/modules/partners';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { UserModule } from '@/modules/user';
import { WalletsModule } from '@/modules/wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    EmployersModule,
    PartnersModule,
    WalletsModule,
    PaymentsModule,
    AllocationsModule,
    HealthModule,
    PartnersModule,
  ],
})
export class AppModule {}
