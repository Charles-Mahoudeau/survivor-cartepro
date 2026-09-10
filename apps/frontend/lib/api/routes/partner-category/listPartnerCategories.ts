import { cache } from 'react';

import { backend } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { PartnerCategory } from '../../schemas/backend/partner-category';

/** Public route: no session is forwarded, so it can run inside `use cache`. */
export const listPartnerCategories = cache(
  async (): Promise<ApiResponse<PartnerCategory[]>> => {
    const { data, error } = await backend('@get/partners/categories');

    if (error) {
      return handleApiError<PartnerCategory[]>(error);
    }

    return { data, error: null };
  },
);
