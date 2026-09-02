import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { RequestWithSession } from '../decorators/current-user.decorator';
import { AuthService } from '../services/auth.service';
import { isBanActive } from '../services/helpers/ban.helper';

/**
 * Resolves the session of every request and refuses the ones that have none.
 *
 * Registered globally, so a route is protected unless it carries `@Public()`.
 * The session is attached to the request, which is what lets `@CurrentUser()`
 * and `RolesGuard` work without reading it a second time.
 *
 * The ban is enforced here rather than left to whatever route the account
 * reaches: Better Auth refuses a banned account at sign-in, but a session
 * opened before the ban stays valid until it expires. Since there is no cookie
 * cache, the `banned` column is read on every request, so a ban takes effect on
 * the next one.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const session = await this.authService.getSession(request.headers);

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
