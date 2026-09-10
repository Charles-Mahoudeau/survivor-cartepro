'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';

import { ApiError } from '@/lib/api/helpers';
import { decideApplication } from '@/lib/api/routes/partner-application';
import { decideApplicationSchema } from '@/lib/api/schemas/backend/partner-application';
import { PARTNERS_TAG } from '@/lib/cache/tags';
import { actionClient } from '@/lib/safe-action';

const decideInputSchema = decideApplicationSchema.extend({
  applicationId: z.uuid(),
});

/**
 * Writes the decision and its reason. A decision is final, so the queue and
 * the dossier are both re-read afterwards rather than patched in place.
 */
export const decideApplicationAction = actionClient
  .inputSchema(decideInputSchema)
  .action(async ({ parsedInput: { applicationId, ...body } }) => {
    const { data, error } = await decideApplication(applicationId, body);

    if (error) {
      throw new ApiError(error);
    }

    updateTag(PARTNERS_TAG);
    revalidatePath('/admin/partners');
    revalidatePath(`/admin/partners/${applicationId}`);

    return data;
  });
