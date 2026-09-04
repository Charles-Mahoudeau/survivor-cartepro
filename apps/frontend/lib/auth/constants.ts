export const AUTH_BASE_PATH = '/auth';

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

export const TOO_MANY_REQUESTS_STATUS = 429;

export const MIN_PASSWORD_LENGTH = 12;
