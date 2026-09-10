import 'server-only';

import { createFetch, createSchema } from '@better-fetch/fetch';

import { backendInternalUrl } from '@/lib/env';
import { backendErrorSchema } from '../../schemas/backend/error';
import { allocationEndpointsSchema } from './endpoints/allocation';
import { employerEndpointsSchema } from './endpoints/employer';
import { transactionEndpointsSchema } from './endpoints/transaction';
import { partnerEndpointsSchema } from './endpoints/partner';
import { partnerApplicationEndpointsSchema } from './endpoints/partner-application';
import { paymentTokenEndpointsSchema } from './endpoints/payment-token';
import { partnerCategoryEndpointsSchema } from './endpoints/partner-category';
import { paymentEndpointsSchema } from './endpoints/payment';
import { walletEndpointsSchema } from './endpoints/wallet';

/** Nest answers under this prefix; `/auth` and `/health` live outside it. */
export const API_BASE_PATH = '/api/v1';

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 200;
const RETRY_MAX_DELAY_MS = 2000;
const FIRST_SERVER_ERROR_STATUS = 500;

const backendSchema = createSchema({
  ...walletEndpointsSchema,
  ...partnerEndpointsSchema,
  ...partnerCategoryEndpointsSchema,
  ...partnerApplicationEndpointsSchema,
  ...paymentTokenEndpointsSchema,
  ...paymentEndpointsSchema,
  ...allocationEndpointsSchema,
  ...employerEndpointsSchema,
  ...transactionEndpointsSchema,
});

function createBackend() {
  return createFetch({
    baseURL: `${backendInternalUrl()}${API_BASE_PATH}`,
    schema: backendSchema,
    errorSchema: backendErrorSchema,
    catchAllError: true,
    retry: {
      type: 'exponential',
      attempts: RETRY_ATTEMPTS,
      baseDelay: RETRY_BASE_DELAY_MS,
      maxDelay: RETRY_MAX_DELAY_MS,
      shouldRetry: (response: Response | null) =>
        response !== null && response.status >= FIRST_SERVER_ERROR_STATUS,
    },
  });
}

type Backend = ReturnType<typeof createBackend>;

let instance: Backend | undefined;

/**
 * Built on first use, not at import: `next build` evaluates this module while
 * collecting page data, and the environment of the build machine is not the
 * one the container runs in.
 */
export const backend: Backend = ((...args: Parameters<Backend>) => {
  instance ??= createBackend();
  return instance(...args);
}) as unknown as Backend;

/**
 * Every code the frontend branches on. The first block mirrors
 * `ERROR_CODES` of the backend, the second is produced client-side.
 */
export const ECODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  PARTNER_NOT_FOUND: 'PARTNER_NOT_FOUND',
  PARTNER_NOT_PENDING: 'PARTNER_NOT_PENDING',
  ALLOCATION_NOT_FOUND: 'ALLOCATION_NOT_FOUND',
  ALLOCATION_ALREADY_APPLIED: 'ALLOCATION_ALREADY_APPLIED',
  EMPLOYER_NOT_FOUND: 'EMPLOYER_NOT_FOUND',
  PAYMENT_TOKEN_NOT_FOUND: 'PAYMENT_TOKEN_NOT_FOUND',
  EMPTY_BALANCE: 'EMPTY_BALANCE',
  PARTNER_NOT_ACTIVE: 'PARTNER_NOT_ACTIVE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  PAYMENT_TOKEN_INVALID: 'PAYMENT_TOKEN_INVALID',
  PAYMENT_TOKEN_LOOKUP_INVALID: 'PAYMENT_TOKEN_LOOKUP_INVALID',
  PAYMENT_TOKEN_EXPIRED: 'PAYMENT_TOKEN_EXPIRED',
  PAYMENT_TOKEN_REVOKED: 'PAYMENT_TOKEN_REVOKED',
  PAYMENT_TOKEN_ALREADY_USED: 'PAYMENT_TOKEN_ALREADY_USED',
  PARTNER_ALREADY_EXISTS: 'PARTNER_ALREADY_EXISTS',
  PARTNER_SIREN_ALREADY_REGISTERED: 'PARTNER_SIREN_ALREADY_REGISTERED',
  PARTNER_CATEGORY_NOT_FOUND: 'PARTNER_CATEGORY_NOT_FOUND',

  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  ERR_API_CONNECTION_REFUSED: 'ERR_API_CONNECTION_REFUSED',
  ERR_API_FETCH_FAILED: 'ERR_API_FETCH_FAILED',
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  GEOCODING_UNAVAILABLE: 'GEOCODING_UNAVAILABLE',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  ACCOUNT_SELF_SUSPENSION: 'ACCOUNT_SELF_SUSPENSION',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type BackendErrorCode = keyof typeof ECODES;
