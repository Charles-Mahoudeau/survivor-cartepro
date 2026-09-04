import { ROLES, type Role } from './constants';

const HOME_BY_ROLE: Record<Role, string> = {
  [ROLES.EMPLOYEE]: '/me',
  [ROLES.PARTNER]: '/pro',
  [ROLES.ADMIN]: '/admin',
};

/**
 * The space a role lands in after signing in.
 *
 * The column holds a free string and can already carry a role this build does
 * not know, so anything unexpected lands in the employee space rather than
 * nowhere — the same widening the API's role guard applies.
 */
export function roleHome(role: string | null | undefined): string {
  return HOME_BY_ROLE[role as Role] ?? HOME_BY_ROLE[ROLES.EMPLOYEE];
}

/**
 * Where to send someone after signing in, honouring the path they were trying
 * to reach. Only a relative path is accepted: an absolute URL, or one starting
 * with a double slash, would turn the sign-in screen into an open redirect.
 */
export function safeRedirect(
  next: string | null | undefined,
  role: string | null | undefined,
): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return roleHome(role);
}
