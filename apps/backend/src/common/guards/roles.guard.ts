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
 * It reads the session `SessionGuard` attached, so the two guards cost one
 * database read between them — which is why registration order matters, this
 * one being second.
 *
 * A route with no `@Roles` is accepted: authentication was already required,
 * and demanding a list everywhere would push every author to write
 * `@Roles(EMPLOYEE, PARTNER, ADMIN)` until it means nothing.
 *
 * The expected list is widened rather than the value asserted to be a `Role`:
 * the column holds a free string and can already carry a role this build does
 * not know.
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
    const accepted: readonly string[] = required;

    if (!role || !accepted.includes(role)) {
      throw new ForbiddenException(ERROR_CODES.FORBIDDEN_ROLE);
    }

    return true;
  }
}
