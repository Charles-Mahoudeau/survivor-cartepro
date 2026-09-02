import { SetMetadata } from '@nestjs/common';
import type { Role } from '@/config/auth/auth.constants';

export const ROLES_KEY = 'auth:roles';

/**
 * Restricts a route to the listed roles. A route with no `@Roles` accepts any
 * authenticated account, since `SessionGuard` has already run.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
