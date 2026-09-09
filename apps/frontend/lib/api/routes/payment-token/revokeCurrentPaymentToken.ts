import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';

export async function revokeCurrentPaymentToken(): Promise<ApiResponse<null>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { error } = await backend('@delete/me/payment-tokens/current', {
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<null>(error);
  }

  return { data: null, error: null };
}
