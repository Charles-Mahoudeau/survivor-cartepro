import { cache } from 'react';

import { backend } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { PartnerCategory } from '../../schemas/backend/partner-category';

/** Public route, like the category list: no session is forwarded. */
export const getPartnerCategory = cache(
  async (slug: string): Promise<ApiResponse<PartnerCategory | null>> => {
    const { data, error } = await backend('@get/partners/categories/:slug', {
      params: { slug },
    });

    if (error) {
      return handleApiError<PartnerCategory | null>(error);
    }

    return { data: data ?? null, error: null };
  },
);
