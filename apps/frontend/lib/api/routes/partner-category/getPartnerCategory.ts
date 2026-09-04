import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { PartnerCategory } from '../../schemas/backend/partner-category';

export const getPartnerCategory = cache(
  async (slug: string): Promise<ApiResponse<PartnerCategory | null>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/partners/categories/:slug', {
      params: { slug },
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<PartnerCategory | null>(error);
    }

    return { data: data ?? null, error: null };
  },
);
