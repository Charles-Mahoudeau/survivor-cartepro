'use server';

import { z } from 'zod';

import { ApiError } from '@/lib/api/helpers';
import { api } from '@/lib/api/routes';
import { MAX_PAGE_LIMIT } from '@/lib/api/schemas/common/cursor-page';
import { actionClient } from '@/lib/safe-action';

/** The next page of the connected employee's movements. The session travels with the call. */
export const loadMoreWalletEntriesAction = actionClient
  .inputSchema(
    z.object({
      cursor: z.string().min(1),
      limit: z.number().int().min(1).max(MAX_PAGE_LIMIT).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { data, error } = await api.wallet.listMyWalletEntries(parsedInput);

    if (error) {
      throw new ApiError(error);
    }

    return data;
  });
