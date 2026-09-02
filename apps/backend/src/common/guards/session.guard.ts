import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import type { RequestWithSession } from '@/common/decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { isBanActive } from '@/common/utils/ban.util';
import { auth } from '@/config/auth/auth';

/**
 * Resolves the session of every request and refuses the ones that have none.
 *
 * Registered globally, so a route is protected unless it carries `@Public()`.
 * The session is attached to the request, which is what lets `@CurrentUser()`
 * and `RolesGuard` work without reading it a second time.
 *
 * It asks Better Auth rather than reading the `session` table itself. The token
 * in the cookie is not the column: validating it is the library's job, and a
 * second implementation of that check is a second place to get it wrong.
 *
 * The ban is enforced here rather than left to whatever route the account
 * reaches: Better Auth refuses a banned account at sign-in, but a session
 * opened before the ban stays valid until it expires. Since there is no cookie
 * cache, the ban columns are read on every request, so a ban takes effect on the
 * next one.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      throw new UnauthorizedException(ERROR_CODES.UNAUTHENTICATED);
    }

    if (isBanActive(session.user, new Date())) {
      throw new ForbiddenException(ERROR_CODES.ACCOUNT_BANNED);
    }

    request.session = session;
    return true;
  }
}
