import 'server-only';

import { forbidden, redirect } from 'next/navigation';

import { ECODES } from '@/lib/api/clients';
import type { ApiErrorCode } from '@/lib/api/helpers';
import { toHook } from '@/lib/api/helpers/toHook';
import { getCurrentPaymentToken } from '@/lib/api/routes/payment-token';
import { throwNextError } from '@/lib/log';

/**
 * Same navigation as the wallet hooks, with two codes the screen renders
 * rather than fails on: no live token yet, and a wallet with nothing left
 * to spend. Both are states of the payment screen, not breakages.
 */
function navigateOnAuthError(error: ApiErrorCode, name: string): void {
  if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
    redirect('/login');
  }
  if (error === ECODES.FORBIDDEN_ROLE) {
    forbidden();
  }
  if (
    error !== ECODES.PAYMENT_TOKEN_NOT_FOUND &&
    error !== ECODES.EMPTY_BALANCE &&
    error !== ECODES.WALLET_NOT_FOUND
  ) {
    throwNextError(new Error(error), `${name} hook returned an error`);
  }
}

export const getCurrentPaymentTokenHook = toHook(
  'getCurrentPaymentToken',
  getCurrentPaymentToken,
  {
    optional: true,
    onError: (error) => navigateOnAuthError(error, 'getCurrentPaymentToken'),
  },
);
