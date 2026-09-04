/** Mirrors AUTH_BASE_PATH in the backend; the client is built with the same value. */
export const AUTH_BASE_PATH = '/auth';

/**
 * Better Auth adds the `__Secure-` prefix when its baseURL is https, so the
 * name depends on how the API is deployed, not on NODE_ENV. Both are probed.
 */
export const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
] as const;

export const ROLES = {
  EMPLOYEE: 'employee',
  PARTNER: 'partner',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** The rate limiter answers with a message and no code, so status is the signal. */
export const TOO_MANY_REQUESTS_STATUS = 429;

/**
 * Mirrors MIN_PASSWORD_LENGTH in the backend, which refuses anything shorter.
 * Stated on the form so the rule is read before it is broken, and enforced by
 * the API either way.
 */
export const MIN_PASSWORD_LENGTH = 12;
