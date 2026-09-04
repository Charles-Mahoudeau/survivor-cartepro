import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { PartnerCategory } from '../../schemas/backend/partner-category';

/** Not `@Public()` on the backend: the session travels with the call. */
export const listPartnerCategories = cache(
  async (): Promise<ApiResponse<PartnerCategory[]>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/partners/categories', {
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<PartnerCategory[]>(error);
    }

    return { data, error: null };
  },
);
