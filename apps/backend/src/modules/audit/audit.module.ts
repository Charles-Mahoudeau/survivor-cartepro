import { Global, Module, type OnApplicationBootstrap } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from '@/modules/audit/controllers';
import { Audit } from '@/modules/audit/entities';
import { AuditRepo } from '@/modules/audit/repos';
import { AuditService } from '@/modules/audit/services';
import { AuditInterceptor } from '@/modules/audit/interceptors';

/**
 * `@Global()` so `AuditInterceptor`, registered once here as `APP_INTERCEPTOR`,
 * can resolve `AuditService` (and its `AuditRepo`, tied to this module's own
 * `TypeOrmModule.forFeature`) when Nest runs it against a route declared in
 * any other module — mirrors `AuthModule`'s own global guards for the same
 * reason.
 *
 * `OnApplicationBootstrap` writes the chain's origin entry on every boot; see
 * `AuditService.ensureChainOrigin` for why that is a no-op past the first one.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Audit])],
  controllers: [AuditController],
  providers: [
    AuditRepo,
    AuditService,
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
  exports: [AuditService],
})
export class AuditModule implements OnApplicationBootstrap {
  constructor(private readonly auditService: AuditService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.auditService.ensureChainOrigin();
  }
}
