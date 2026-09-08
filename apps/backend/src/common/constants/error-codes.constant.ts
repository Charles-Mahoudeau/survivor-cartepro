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
  /** The requested period starts after it ends. */
  INVALID_PERIOD: 'INVALID_PERIOD',
  /** The partner application is not pending, so it cannot be decided again. */
  PARTNER_NOT_PENDING: 'PARTNER_NOT_PENDING',
  /** The account depositing a dossier already owns one. */
  PARTNER_ALREADY_EXISTS: 'PARTNER_ALREADY_EXISTS',
  /** The SIREN is already registered to another partner dossier. */
  PARTNER_SIREN_ALREADY_REGISTERED: 'PARTNER_SIREN_ALREADY_REGISTERED',
  /** One or more category slugs in the request do not exist. */
  PARTNER_CATEGORY_NOT_FOUND: 'PARTNER_CATEGORY_NOT_FOUND',
  /** The account was created, but its wallet could not be — registration is rolled back. */
  WALLET_CREATION_FAILED: 'WALLET_CREATION_FAILED',
  /** The requested employer does not exist. */
  EMPLOYER_NOT_FOUND: 'EMPLOYER_NOT_FOUND',
  /** The requested allocation does not exist. */
  ALLOCATION_NOT_FOUND: 'ALLOCATION_NOT_FOUND',
  /** The allocation has already been applied and can no longer change. */
  ALLOCATION_ALREADY_APPLIED: 'ALLOCATION_ALREADY_APPLIED',
  /** The scanned QR or the short code does not resolve to any live payment token. */
  PAYMENT_TOKEN_INVALID: 'PAYMENT_TOKEN_INVALID',
  /** A newer payment token has since been issued for the same wallet. */
  PAYMENT_TOKEN_REVOKED: 'PAYMENT_TOKEN_REVOKED',
  /** The token is consumed but carries no payment — an invariant violation, never expected. */
  PAYMENT_TOKEN_CONSUMED: 'PAYMENT_TOKEN_CONSUMED',
  /** The token was already consumed by a collection for a different partner or amount. */
  PAYMENT_TOKEN_ALREADY_CLAIMED: 'PAYMENT_TOKEN_ALREADY_CLAIMED',
  /** The payment token's validity window has passed. */
  PAYMENT_TOKEN_EXPIRED: 'PAYMENT_TOKEN_EXPIRED',
  /** The wallet balance cannot absorb this debit, even within the overdraft limit. */
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  /** The partner is not active, so it cannot collect a payment. */
  PARTNER_NOT_ACTIVE: 'PARTNER_NOT_ACTIVE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
