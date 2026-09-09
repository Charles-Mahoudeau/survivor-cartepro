import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { PaymentToken } from '../../schemas/backend/payment-token';

/**
 * Not `cache`d, unlike the reads: two calls in one render must mint two
 * tokens, since issuing is what revokes the one before it.
 */
export async function issuePaymentToken(): Promise<ApiResponse<PaymentToken>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend('@post/me/payment-tokens', {
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<PaymentToken>(error);
  }

  return { data, error: null };
}
