import { getAuth } from '@/lib/auth/cookies';
import { authServerClient } from '@/lib/auth/server';
import { ECODES } from '../../clients';
import type { ApiResponse } from '../../helpers';
import { type Account, accountSchema } from '../../schemas/backend/account';
import { handleAccountError, parseAccountResponse } from './helpers';

/** One account, as the administration sees it. Never cached. */
export async function getAccount(
  userId: string,
): Promise<ApiResponse<Account>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await authServerClient().admin.getUser({
    query: { id: userId },
    fetchOptions: { headers: auth.headers, cache: 'no-store' },
  });

  if (error) {
    return handleAccountError<Account>(error);
  }

  return parseAccountResponse(accountSchema, data);
}
