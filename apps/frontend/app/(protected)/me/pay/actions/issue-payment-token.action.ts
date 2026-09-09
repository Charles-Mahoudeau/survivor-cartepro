'use server';

import { ApiError } from '@/lib/api/helpers';
import { issuePaymentToken } from '@/lib/api/routes/payment-token';
import { actionClient } from '@/lib/safe-action';

/** Mints a token, which revokes whichever one the account still held. */
export const issuePaymentTokenAction = actionClient.action(async () => {
  const { data, error } = await issuePaymentToken();

  if (error) {
    throw new ApiError(error);
  }

  return data;
});
