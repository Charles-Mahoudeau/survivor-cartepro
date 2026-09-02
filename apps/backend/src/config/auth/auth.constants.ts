/**
 * Values that both the Better Auth instance and the Nest layer must agree on.
 * They live here rather than inline so a change lands in one place: the base
 * path is also what the frontend client is configured with, and the role names
 * are compared against `session.user.role` on every guarded route.
 */

/**
 * Where Better Auth mounts its own routes. Kept flat like `/health` and `/docs`
 * rather than the library default `/api/auth`, since this API has no `/api`
 * segment anywhere else. The client must be built with the same `basePath`.
 */
export const AUTH_BASE_PATH = '/auth';

/**
 * The three spaces of the dispositif, one role each — an account carries
 * exactly one, because `user.role` is a single column and nothing writes a
 * list into it.
 *
 * `EMPLOYEE` is what the admin plugin assigns on sign-up: it is the path
 * everyone takes, and it grants nothing beyond one's own wallet. `PARTNER` and
 * `ADMIN` are granted out of band — a partner account is validated by the
 * administration before it can collect anything, and an administrator is
 * promoted by someone who already is one.
 */
export const ROLES = {
  EMPLOYEE: 'employee',
  PARTNER: 'partner',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Roles the admin plugin treats as administrators. Everything it exposes
 * (listing users, banning, impersonating) is refused to anyone whose role is
 * not in this list.
 */
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN];

/**
 * What a banned account is told at sign-in. Distinct from the credentials
 * error on purpose: refusing a correct password with « identifiants
 * incorrects » sends someone to reset a password that was never the problem.
 * It names no reason and no expiry — that is for the administration to give,
 * not for an unauthenticated response to disclose.
 */
export const BANNED_USER_MESSAGE =
  'Ce compte est suspendu. Contactez l’administration du dispositif.';

/**
 * Sign-in attempts allowed per window, per address. The sixth inside a minute
 * is refused with a 429 — slow enough to stop a credential-stuffing run, wide
 * enough that someone mistyping their password twice is not locked out.
 */
export const SIGN_IN_RATE_LIMIT = { window: 60, max: 5 } as const;

/** Seven days, the library default, restated so the value is greppable. */
export const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

/** A session older than this is extended on use, so an active user is not signed out. */
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

/**
 * ANSSI recommends twelve characters for a password that carries no second
 * factor. The library default is eight.
 */
export const MIN_PASSWORD_LENGTH = 12;

/**
 * Splits the comma-separated trusted-origin list.
 *
 * Whitespace around a value is dropped and an empty entry is discarded, so a
 * trailing comma or a list wrapped across lines in a `.env` does not produce an
 * empty-string origin — which would match nothing and be invisible in a diff.
 *
 * It lives here, next to the values it parses, rather than beside the Better
 * Auth instance: that module builds a connection pool at import, and a unit
 * test has no business opening one.
 */
export function parseTrustedOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
