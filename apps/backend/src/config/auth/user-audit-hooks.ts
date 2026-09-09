import { isAPIError } from 'better-auth/api';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import type { AuditService } from '@/modules/audit/services/audit.service';

const USER_TARGET_TYPE = 'user';

/** Better Auth's own `/admin/set-role` endpoint path, unprefixed by `AUTH_BASE_PATH`. */
const SET_ROLE_PATH = '/admin/set-role';
const BAN_PATHS = new Set(['/admin/ban-user', '/admin/unban-user']);

export function auditAccountCreated(
  auditService: AuditService,
  userId: string,
): Promise<void> {
  return auditService.record({
    action: AuditAction.ACCOUNT_CREATED,
    targetType: USER_TARGET_TYPE,
    targetId: userId,
    actorId: null,
    actorRole: null,
    payload: null,
    ip: null,
  });
}

export interface UserUpdateAuditContext {
  /** The Better Auth endpoint that triggered the write, e.g. `/admin/set-role`. */
  path: string | null;
  /** The signed-in caller, if any — the same account for a self-service update. */
  actorId: string | null;
  actorRole: string | null;
}

/**
 * Pure on purpose, so the classification is unit-testable without building a
 * fake Better Auth endpoint context.
 *
 * A role change always gets its own action, whoever the caller is. A ban or
 * unban is an administrative action on someone else's account, never a
 * self-service one. Anything else is ACCOUNT_UPDATED when the account acts
 * on itself, or ADMIN_ACTION when a different, already-authenticated caller
 * — an admin editing someone else's profile through `/admin/update-user` —
 * is the one who triggered it.
 *
 * This also covers writes with no dedicated admin path, like a password
 * change or a reset: they still go through `user.update` under the hood, so
 * they still land as ACCOUNT_UPDATED — consistent with "account
 * modification" being the broad bucket the letter intends it to be.
 */
export function classifyUserUpdateAction(
  updatedUserId: string,
  context: UserUpdateAuditContext,
): AuditAction {
  if (context.path === SET_ROLE_PATH) {
    return AuditAction.ROLE_CHANGED;
  }
  if (context.path !== null && BAN_PATHS.has(context.path)) {
    return AuditAction.ADMIN_ACTION;
  }
  if (context.actorId && context.actorId !== updatedUserId) {
    return AuditAction.ADMIN_ACTION;
  }
  return AuditAction.ACCOUNT_UPDATED;
}

export function auditAccountUpdated(
  auditService: AuditService,
  updatedUserId: string,
  updatedRole: string | null,
  context: UserUpdateAuditContext,
): Promise<void> {
  const action = classifyUserUpdateAction(updatedUserId, context);

  return auditService.record({
    action,
    targetType: USER_TARGET_TYPE,
    targetId: updatedUserId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    payload: action === AuditAction.ROLE_CHANGED ? { role: updatedRole } : null,
    ip: null,
  });
}

/** Better Auth's credential sign-in path, unprefixed by `AUTH_BASE_PATH`. */
const SIGN_IN_EMAIL_PATH = '/sign-in/email';

/**
 * True when a credential sign-in came back as an error rather than a session.
 *
 * Better Auth runs its `after` hooks on the failure path too: a thrown
 * `APIError` is caught, assigned to `context.returned`, and only then are the
 * hooks called. So the outcome is read from what was returned, never from the
 * absence of a session.
 */
export function isFailedSignIn(path: string, returned: unknown): boolean {
  return path === SIGN_IN_EMAIL_PATH && isAPIError(returned);
}

/**
 * The address someone tried to sign in as, or null when the body carried none.
 */
export function readAttemptedEmail(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('email' in body)) {
    return null;
  }
  const { email } = body;

  return typeof email === 'string' ? email : null;
}

export interface FailedSignInAuditContext {
  email: string | null;
  ip: string | null;
}

/**
 * Records a rejected sign-in. The actor is null by construction — nobody is
 * authenticated — so the attempted address and the address it came from are
 * the whole value of the entry. The credentials themselves never reach it:
 * only the email is read out of the body, never the body itself.
 */
export function auditFailedSignIn(
  auditService: AuditService,
  context: FailedSignInAuditContext,
): Promise<void> {
  return auditService.record({
    action: AuditAction.LOGIN_FAILED,
    targetType: USER_TARGET_TYPE,
    targetId: null,
    actorId: null,
    actorRole: null,
    payload: context.email ? { email: context.email } : null,
    ip: context.ip,
  });
}
