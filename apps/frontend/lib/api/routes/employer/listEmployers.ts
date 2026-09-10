import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { EmployerPage } from '../../schemas/backend/employer';
import type { PaginationQuery } from '../../schemas/common/cursor-page';

export const listEmployers = cache(
  async (query: PaginationQuery = {}): Promise<ApiResponse<EmployerPage>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/employers', {
      query,
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<EmployerPage>(error);
    }

    return { data, error: null };
  },
);
