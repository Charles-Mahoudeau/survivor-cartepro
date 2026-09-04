import { cache } from 'react';

import { backend } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type {
  ListPartnersQuery,
  PartnerPage,
} from '../../schemas/backend/partner';

/** Public route: no session is forwarded, so it can run inside `use cache`. */
export const listPartners = cache(
  async (query: ListPartnersQuery = {}): Promise<ApiResponse<PartnerPage>> => {
    const { data, error } = await backend('@get/partners', { query });

    if (error) {
      return handleApiError<PartnerPage>(error);
    }

    return { data, error: null };
  },
);
