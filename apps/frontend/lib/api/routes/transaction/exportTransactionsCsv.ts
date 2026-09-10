import { getAuth } from '@/lib/auth/cookies';
import { backend, ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';

/** The CSV of every transaction, as the backend writes it. Never cached. */
export async function exportTransactionsCsv(): Promise<ApiResponse<string>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await backend('@get/admin/transactions.csv', {
    headers: auth.headers,
    cache: 'no-store',
  });

  if (error) {
    return handleApiError<string>(error);
  }

  return { data, error: null };
}
