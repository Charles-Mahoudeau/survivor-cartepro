import { cache } from 'react';

import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type { PartnerProfile } from '../../schemas/backend/partner';

/** The dossier of the signed-in partner, status and last decision included. Never cached. */
export const getMyPartnerProfile = cache(
  async (): Promise<ApiResponse<PartnerProfile>> => {
    const auth = await getAuth();

    if (!auth.hasToken) {
      return { data: null, error: ECODES.UNAUTHENTICATED };
    }

    const { data, error } = await backend('@get/partners/me/profile', {
      headers: auth.headers,
      cache: 'no-store',
    });

    if (error) {
      return handleApiError<PartnerProfile>(error);
    }

    return { data, error: null };
  },
);
