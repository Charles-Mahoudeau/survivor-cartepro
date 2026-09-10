import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { AllocationDetail } from '../../schemas/backend/allocation';

export const getAllocation = cache(
  async (allocationId: string): Promise<ApiResponse<AllocationDetail>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/allocations/:allocationId', {
      params: { allocationId },
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<AllocationDetail>(error);
    }

    return { data, error: null };
  },
);
