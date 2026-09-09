import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type {
  ApplicationPage,
  ListApplicationsQuery,
} from '../../schemas/backend/partner-application';

export const listApplications = cache(
  async (
    query: ListApplicationsQuery = {},
  ): Promise<ApiResponse<ApplicationPage>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/partners/applications', {
      query,
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<ApplicationPage>(error);
    }

    return { data, error: null };
  },
);
