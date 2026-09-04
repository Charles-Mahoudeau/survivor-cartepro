import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { Wallet } from '../../schemas/backend/wallet';

export const getMyWallet = cache(async (): Promise<ApiResponse<Wallet>> => {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend('@get/me/wallet', {
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<Wallet>(error);
  }

  return { data, error: null };
});
