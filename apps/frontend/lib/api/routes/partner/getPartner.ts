import { cache } from 'react';

import { backend } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { Partner } from '../../schemas/backend/partner';

export const getPartner = cache(
  async (partnerId: string): Promise<ApiResponse<Partner>> => {
    const { data, error } = await backend('@get/partners/:partnerId', {
      params: { partnerId },
    });

    if (error) {
      return handleApiError<Partner>(error);
    }

    return { data, error: null };
  },
);
