import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type {
  PartnerProfile,
  UpdatePartnerProfile,
} from '../../schemas/backend/partner';

/** Saves the public details of the signed-in partner. Never cached: it writes. */
export async function updateMyPartnerProfile(
  body: UpdatePartnerProfile,
): Promise<ApiResponse<PartnerProfile>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend('@patch/partners/me/profile', {
    body,
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<PartnerProfile>(error);
  }

  return { data, error: null };
}
