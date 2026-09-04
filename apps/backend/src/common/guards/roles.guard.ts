import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import type { RequestWithSession } from '@/common/decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import type { Role } from '@/config/auth/auth.constants';

/**
 * Refuses a request whose role is not one the route accepts.
 *
 * It reads the session `SessionGuard` attached, so the two guards cost one
 * database read between them — which is why registration order matters, this
 * one being second.
 *
 * A route that declares no role is refused, not served. Authentication was
 * already closed by default; leaving authorisation open meant a handler added
 * without `@Roles` answered every signed-in account, and an omission is exactly
 * what a review does not see. Opening a route to all three roles is now written
 * out, so the intent is greppable instead of implied.
 *
 * `@Public()` is the single opt-out and is read here as well: `SessionGuard`
 * returns early on it, which would otherwise leave a public route with no role
 * to be refused by the check below.
 *
 * The expected list is widened rather than the value asserted to be a `Role`:
 * the column holds a free string and can already carry a role this build does
 * not know. An absent list is an empty one, so a missing annotation and a role
 * mismatch fail through the same branch — and answer the same thing, which is
 * what keeps a misconfigured route from announcing itself to a caller.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      targets,
    );
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const role = request.session?.user.role;
    const accepted: readonly string[] = required ?? [];

    if (!role || !accepted.includes(role)) {
      throw new ForbiddenException(ERROR_CODES.FORBIDDEN_ROLE);
    }

    return true;
  }
}
