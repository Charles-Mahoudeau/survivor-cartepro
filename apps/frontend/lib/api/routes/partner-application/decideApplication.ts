import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';
import type {
  ApplicationDetail,
  DecideApplication,
} from '../../schemas/backend/partner-application';

/** A decision is written once and never rewritten, so this is never cached. */
export async function decideApplication(
  applicationId: string,
  body: DecideApplication,
): Promise<ApiResponse<ApplicationDetail>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend(
    '@post/partners/applications/:applicationId/decision',
    {
      params: { applicationId },
      body,
      headers: auth.headers,
      cache: 'no-store',
    },
  );

  if (error) {
    return handleApiError<ApplicationDetail>(error);
  }

  return { data, error: null };
}
