import { ROLES, type Role } from './constants';

const HOME_BY_ROLE: Record<Role, string> = {
  [ROLES.EMPLOYEE]: '/me',
  [ROLES.PARTNER]: '/pro',
  [ROLES.ADMIN]: '/admin',
};

export function roleHome(role: string | null | undefined): string {
  return HOME_BY_ROLE[role as Role] ?? HOME_BY_ROLE[ROLES.EMPLOYEE];
}

export function safeRedirect(
  next: string | null | undefined,
  role: string | null | undefined,
): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return roleHome(role);
}
