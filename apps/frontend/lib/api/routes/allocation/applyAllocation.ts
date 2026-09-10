import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { AllocationApplied } from '../../schemas/backend/allocation';

/** Credits every eligible wallet. The entries it writes are immutable. */
export async function applyAllocation(
  allocationId: string,
): Promise<ApiResponse<AllocationApplied>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend(
    '@post/allocations/:allocationId/apply',
    {
      params: { allocationId },
      headers: auth.headers,
      cache: 'no-store',
    },
  );

  if (error) {
    return handleApiError<AllocationApplied>(error);
  }

  return { data, error: null };
}
