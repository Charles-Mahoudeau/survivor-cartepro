import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type {
  CollectPayment,
  PaymentReceipt,
} from '../../schemas/backend/payment';

/** Never cached: each call is a debit, and the token it spends dies with it. */
export async function collectPayment(
  body: CollectPayment,
): Promise<ApiResponse<PaymentReceipt>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend('@post/payments', {
    body,
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<PaymentReceipt>(error);
  }

  return { data, error: null };
}
