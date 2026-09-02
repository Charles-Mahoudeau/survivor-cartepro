import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import type { Role } from '@/config/auth/auth.constants';
import type { RequestWithSession } from '../decorators/current-user.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

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

    if (!role || !required.includes(role as Role)) {
      throw new ForbiddenException(ERROR_CODES.FORBIDDEN_ROLE);
    }

    return true;
  }
}
