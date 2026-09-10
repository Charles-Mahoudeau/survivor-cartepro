'use server';

import { ApiError } from '@/lib/api/helpers';
import { listPartnersQuerySchema } from '@/lib/api/schemas/backend/partner';
import { loadPartners } from '@/hooks/api/proxy/partner.hook';
import { actionClient } from '@/lib/safe-action';

/** The next page of the catalogue, served from the same cached loader as the page. */
export const loadMorePartnersAction = actionClient
  .inputSchema(listPartnersQuerySchema)
  .action(async ({ parsedInput }) => {
    const { data, error } = await loadPartners(parsedInput);

    if (error) {
      throw new ApiError(error);
    }

    return data;
  });
