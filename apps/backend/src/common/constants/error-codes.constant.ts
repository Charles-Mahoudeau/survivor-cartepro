/**
 * Every error code this API can put on the wire.
 *
 * A code is a stable contract: the frontend branches on it, the documentation
 * lists it, and a message is free to change without breaking either. Hence one
 * registry rather than string literals thrown from wherever the error is
 * raised — a code that exists in only one file cannot be documented and cannot
 * be tested for.
 */
export const ERROR_CODES = {
  /** No session on the request, or the session has expired. */
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  /** The account exists and is banned, and the ban has not expired. */
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  /** The session is valid, but its role is not one the route accepts. */
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
