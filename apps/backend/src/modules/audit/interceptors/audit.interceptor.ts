import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import {
  AUDIT_KEY,
  AuditMetadata,
  AuditResolverContext,
} from '@/modules/audit/decorators/audited.decorator';
import { AuditService } from '@/modules/audit/services/audit.service';
import { RequestWithSession } from '@/common/decorators';

/**
 * The single capture point for every `@Audited` route: reads the route's
 * metadata, resolves the actor from the session `SessionGuard` already
 * attached, and records the entry once the handler has succeeded. No
 * controller or service calls `AuditService` directly.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const actorId = request.session?.user.id ?? null;
    const actorRole = request.session?.user.role ?? null;
    const ip = request.ip ?? null;
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(request.params)) {
      params[key] = Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
    }

    return next.handle().pipe(
      tap((result: unknown) => {
        const resolverContext: AuditResolverContext = {
          params,
          body: request.body as unknown,
          result,
        };
        const action = meta.resolveAction
          ? meta.resolveAction(resolverContext)
          : meta.action;
        const targetId = meta.resolveTargetId
          ? meta.resolveTargetId(resolverContext)
          : (params.id ?? null);

        void this.auditService.record({
          action,
          targetType: meta.targetType,
          targetId,
          actorId,
          actorRole,
          payload: request.body as Record<string, unknown> | null,
          ip,
        });
      }),
    );
  }
}
