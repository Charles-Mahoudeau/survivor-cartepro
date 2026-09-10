'use server';

import { revalidatePath } from 'next/cache';

import { ApiError } from '@/lib/api/helpers';
import { createAllocation } from '@/lib/api/routes/allocation';
import { createAllocationSchema } from '@/lib/api/schemas/backend/allocation';
import { actionClient } from '@/lib/safe-action';

/** Creates the allocation as a draft. Nothing is credited until it is applied. */
export const createAllocationAction = actionClient
  .inputSchema(createAllocationSchema)
  .action(async ({ parsedInput }) => {
    const { data, error } = await createAllocation(parsedInput);

    if (error) {
      throw new ApiError(error);
    }

    revalidatePath('/admin/allocations');

    return data;
  });
