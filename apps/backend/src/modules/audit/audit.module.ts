import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
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
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Audit])],
  providers: [
    AuditRepo,
    AuditService,
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
  exports: [AuditService],
})
export class AuditModule {}
