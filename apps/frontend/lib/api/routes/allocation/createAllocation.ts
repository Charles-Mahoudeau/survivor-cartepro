import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type {
  Allocation,
  CreateAllocation,
} from '../../schemas/backend/allocation';

export async function createAllocation(
  body: CreateAllocation,
): Promise<ApiResponse<Allocation>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend('@post/allocations', {
    body,
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<Allocation>(error);
  }

  return { data, error: null };
}
