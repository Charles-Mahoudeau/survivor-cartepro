'use server';

import { ApiError } from '@/lib/api/helpers';
import { collectPayment } from '@/lib/api/routes/payment';
import { collectPaymentSchema } from '@/lib/api/schemas/backend/payment';
import { actionClient } from '@/lib/safe-action';

/**
 * Debits the employee wallet and spends the code. Not retried and not cached:
 * a second call would be a second debit, and the token dies with the first.
 */
export const collectPaymentAction = actionClient
  .inputSchema(collectPaymentSchema)
  .action(async ({ parsedInput }) => {
    const { data, error } = await collectPayment(parsedInput);

    if (error) {
      throw new ApiError(error);
    }

    return data;
  });
