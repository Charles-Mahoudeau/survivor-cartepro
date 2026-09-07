/**
 * Every error code this API can put on the wire.
 *
 * A code is a stable contract the frontend branches on, while a message is free
 * to change. One registry, because a code that exists in a single file cannot
 * be documented and cannot be tested for.
 */
export const ERROR_CODES = {
  /** No session on the request, or it has expired. */
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  /** The account is banned and the ban has not expired. */
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  /** The session is valid, but its role is not one the route accepts. */
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
  /** The connected account has no wallet. */
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  /** The requested partner does not exist or is not active. */
  PARTNER_NOT_FOUND: 'PARTNER_NOT_FOUND',
  /** The requested period starts after it ends. */
  INVALID_PERIOD: 'INVALID_PERIOD',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
