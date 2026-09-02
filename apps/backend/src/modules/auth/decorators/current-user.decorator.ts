import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthSession, AuthUser } from '@/config/auth/auth';

/**
 * The shape `SessionGuard` attaches to the request once it has resolved a
 * session. Declared here so the guard and the decorator cannot disagree about
 * the property name.
 */
export interface RequestWithSession extends Request {
  session?: AuthSession;
}

/**
 * Hands the handler the authenticated account.
 *
 * It never resolves the session itself: `SessionGuard` has already done the
 * read and refused the request if there was none, so a route reaching this
 * decorator always has one. A parameter decorator that re-read the session
 * would double the query count of every guarded route.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    return request.session!.user;
  },
);
