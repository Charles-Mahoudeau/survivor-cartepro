/**
 * Values the Better Auth instance and the Nest layer must agree on. The base
 * path is also what the frontend client is built with, and the role names are
 * compared against `session.user.role` on every guarded route.
 */

/** Flat like `/health` and `/docs`; the library default is `/api/auth`. */
export const AUTH_BASE_PATH = '/auth';

/**
 * One role per space of the dispositif. An account carries exactly one, since
 * `user.role` is a scalar column. Sign-up assigns `EMPLOYEE`; the other two are
 * granted out of band.
 */
export const ROLES = {
  EMPLOYEE: 'employee',
  PARTNER: 'partner',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles the admin plugin treats as administrators. */
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN];

/**
 * What a banned account is told at sign-in. Distinct from the credentials
 * error: refusing a correct password with « identifiants incorrects » sends
 * someone to reset a password that was never the problem.
 */
export const BANNED_USER_MESSAGE =
  'Ce compte est suspendu. Contactez l’administration du dispositif.';

/** Five allowed per window, so the sixth attempt of a minute is refused. */
export const SIGN_IN_RATE_LIMIT = { window: 60, max: 5 } as const;

/** Seven days, the library default, restated so the value is greppable. */
export const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

/** A session older than this is extended on use. */
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

/** ANSSI-PG-078, for a password with no second factor. The default is 8. */
export const MIN_PASSWORD_LENGTH = 12;

/**
 * Splits the comma-separated trusted-origin list, dropping blanks so a trailing
 * comma does not yield an empty origin.
 *
 * It lives here rather than beside the Better Auth instance: that module builds
 * a connection pool at import, and a unit test has no business opening one.
 */
export function parseTrustedOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
