import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type {
  CreatePartner,
  PartnerProfile,
} from '../../schemas/backend/partner';

/** Files the dossier of the signed-in account. Never cached: it writes. */
export async function createPartner(
  body: CreatePartner,
): Promise<ApiResponse<PartnerProfile>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend('@post/partners', {
    body,
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<PartnerProfile>(error);
  }

  return { data, error: null };
}
