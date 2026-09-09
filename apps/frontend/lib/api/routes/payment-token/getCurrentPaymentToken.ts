import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { PaymentToken } from '../../schemas/backend/payment-token';

export const getCurrentPaymentToken = cache(
  async (): Promise<ApiResponse<PaymentToken>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/me/payment-tokens/current', {
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<PaymentToken>(error);
    }

    return { data, error: null };
  },
);
