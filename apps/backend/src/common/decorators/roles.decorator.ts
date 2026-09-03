import { SetMetadata } from '@nestjs/common';
import type { Role } from '@/config/auth/auth.constants';

export const ROLES_KEY = 'auth:roles';

/**
 * Restricts a route to the listed roles. Every authenticated route carries one:
 * a route with no `@Roles` is refused, so opening one to everybody is spelled
 * out rather than left to an omission. `@Public()` is the opt-out.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
