import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthSession, AuthUser } from '@/config/auth/auth';

/** What `SessionGuard` attaches once it has resolved a session. */
export interface RequestWithSession extends Request {
  session?: AuthSession;
}

/**
 * Hands the handler the authenticated account.
 *
 * The type arguments are what the decorator accepts and what it returns.
 * `undefined` makes `@CurrentUser('email')` a compile error rather than a
 * silently ignored string; `AuthUser` keeps `role`, `banned` and `banExpires`
 * typed instead of `any`.
 *
 * It never resolves the session itself: `SessionGuard` has already done the
 * read, and a second one would double the query count of every guarded route.
 */
export const CurrentUser = createParamDecorator<undefined, AuthUser>(
  (_, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    return request.session!.user;
  },
);
