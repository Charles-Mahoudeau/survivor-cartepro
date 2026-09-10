'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ApiError } from '@/lib/api/helpers';
import { applyAllocation } from '@/lib/api/routes/allocation';
import { actionClient } from '@/lib/safe-action';

/**
 * Credits every eligible wallet, once. The entries it writes are immutable, so
 * both the list and the allocation are re-read rather than patched in place.
 */
export const applyAllocationAction = actionClient
  .inputSchema(z.object({ allocationId: z.uuid() }))
  .action(async ({ parsedInput: { allocationId } }) => {
    const { data, error } = await applyAllocation(allocationId);

    if (error) {
      throw new ApiError(error);
    }

    revalidatePath('/admin/allocations');
    revalidatePath(`/admin/allocations/${allocationId}`);

    return data;
  });
