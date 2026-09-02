import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import type { RequestWithSession } from '@/common/decorators/current-user.decorator';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import type { Role } from '@/config/auth/auth.constants';

/**
 * Refuses a request whose role is not one the route accepts.
 *
 * It reads the session `SessionGuard` attached and never resolves one itself,
 * so the two guards cost one database read between them. Nest runs global
 * guards in registration order, which is what makes that safe — this one is
 * registered second.
 *
 * A route with no `@Roles` is accepted: authentication was already required by
 * the guard before it, and demanding a role list on every route would push
 * every author to write `@Roles(USER, ADMIN)` until it means nothing.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const role = request.session?.user.role;

    // The column holds a free string — it can already carry a role this build
    // does not know, such as one added by a later lot. The question asked here
    // is whether that string is among the names the route accepts, so the list
    // is widened rather than the value asserted to be a `Role` it may not be.
    const accepted: readonly string[] = required;

    if (!role || !accepted.includes(role)) {
      throw new ForbiddenException(ERROR_CODES.FORBIDDEN_ROLE);
    }

    return true;
  }
}
