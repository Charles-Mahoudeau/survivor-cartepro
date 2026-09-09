import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { ApplicationDetail } from '../../schemas/backend/partner-application';

export const getApplication = cache(
  async (applicationId: string): Promise<ApiResponse<ApplicationDetail>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend(
      '@get/partners/applications/:applicationId',
      {
        params: { applicationId },
        headers: auth.headers,
        cache: 'no-store',
      },
    );

    if (error) {
      return handleApiError<ApplicationDetail>(error);
    }

    return { data, error: null };
  },
);
