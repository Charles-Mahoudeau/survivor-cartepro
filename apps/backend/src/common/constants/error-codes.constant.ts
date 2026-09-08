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
  /** The account is banned and the ban has not expired, or the wallet itself is disabled. */
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  /** The session is valid, but its role is not one the route accepts. */
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
  /** The connected account has no wallet. */
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  /** The wallet balance is zero or negative — nothing to spend. */
  EMPTY_BALANCE: 'EMPTY_BALANCE',
  /** The wallet has no live payment token. */
  PAYMENT_TOKEN_NOT_FOUND: 'PAYMENT_TOKEN_NOT_FOUND',
  /** The requested partner does not exist or is not active. */
  PARTNER_NOT_FOUND: 'PARTNER_NOT_FOUND',
  /** The partner application is not pending, so it cannot be decided again. */
  PARTNER_NOT_PENDING: 'PARTNER_NOT_PENDING',
  /** The requested employer does not exist. */
  EMPLOYER_NOT_FOUND: 'EMPLOYER_NOT_FOUND',
  /** The requested allocation does not exist. */
  ALLOCATION_NOT_FOUND: 'ALLOCATION_NOT_FOUND',
  /** The allocation has already been applied and can no longer change. */
  ALLOCATION_ALREADY_APPLIED: 'ALLOCATION_ALREADY_APPLIED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
