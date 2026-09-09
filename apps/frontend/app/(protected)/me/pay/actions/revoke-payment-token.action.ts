'use server';

import { ECODES } from '@/lib/api/clients';
import { ApiError } from '@/lib/api/helpers';
import { revokeCurrentPaymentToken } from '@/lib/api/routes/payment-token';
import { actionClient } from '@/lib/safe-action';

/**
 * Cancelling a token nobody holds is the outcome the screen wanted, so a
 * missing one is not reported as a failure.
 */
export const revokePaymentTokenAction = actionClient.action(async () => {
  const { error } = await revokeCurrentPaymentToken();

  if (error && error !== ECODES.PAYMENT_TOKEN_NOT_FOUND) {
    throw new ApiError(error);
  }

  return null;
});
