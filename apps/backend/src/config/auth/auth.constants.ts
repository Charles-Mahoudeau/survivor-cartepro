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
 * The two roles of this lot. `USER` is what the admin plugin assigns to every
 * account created through sign-up; `ADMIN` is granted out of band. A third role
 * for partners is additive — the column already holds an arbitrary string.
 */
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Roles the admin plugin treats as administrators. Everything it exposes
 * (listing users, banning, impersonating) is refused to anyone whose role is
 * not in this list.
 */
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN];

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
