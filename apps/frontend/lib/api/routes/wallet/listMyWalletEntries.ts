import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { WalletEntryPage } from '../../schemas/backend/wallet-entry';
import type { PaginationQuery } from '../../schemas/common/cursor-page';

export const listMyWalletEntries = cache(
  async (
    query: PaginationQuery = {},
  ): Promise<ApiResponse<WalletEntryPage>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/me/wallet/entries', {
      query,
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<WalletEntryPage>(error);
    }

    return { data, error: null };
  },
);
