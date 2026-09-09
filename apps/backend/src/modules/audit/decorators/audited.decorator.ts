import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';

export const AUDIT_KEY = 'audit:action';

export interface AuditResolverContext {
  params: Record<string, string>;
  body: unknown;
  result: unknown;
}

export interface AuditOptions {
  /** Only when the target id isn't the route's `:id` param. */
  resolveTargetId?: (ctx: AuditResolverContext) => string;
  /**
   * Only when one route can log different actions depending on its
   * outcome (e.g. an approve/refuse decision behind a single endpoint).
   * Overrides `action` when present.
   */
  resolveAction?: (ctx: AuditResolverContext) => AuditAction;
  /**
   * What to record when the handler throws. Absent by default: most routes
   * refuse on a precondition and have nothing to prove. Present where the
   * refusal is itself the sensitive operation — a collection refused for an
   * insufficient balance is exactly what the letter asks to trace.
   */
  failureAction?: AuditAction;
}

export interface AuditMetadata extends AuditOptions {
  action: AuditAction;
  targetType: string;
}

/**
 * Marks a controller method as a sensitive operation to record. Does
 * nothing by itself — `AuditInterceptor` reads this metadata back and is
 * the single place that actually writes to the audit log, so no
 * controller or service ever calls it directly.
 */
export const Audited = (
  action: AuditAction,
  targetType: string,
  options?: AuditOptions,
) => SetMetadata(AUDIT_KEY, { action, targetType, ...options });
