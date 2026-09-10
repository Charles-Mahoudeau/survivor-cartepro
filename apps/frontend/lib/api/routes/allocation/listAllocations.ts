import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { AllocationPage } from '../../schemas/backend/allocation';
import type { PaginationQuery } from '../../schemas/common/cursor-page';

export const listAllocations = cache(
  async (query: PaginationQuery = {}): Promise<ApiResponse<AllocationPage>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/allocations', {
      query,
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<AllocationPage>(error);
    }

    return { data, error: null };
  },
);
