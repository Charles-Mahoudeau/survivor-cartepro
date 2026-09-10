import { getAuth } from '@/lib/auth/cookies';
import { authServerClient } from '@/lib/auth/server';
import { ECODES } from '../../clients';
import type { ApiResponse } from '../../helpers';
import { type Account, accountSchema } from '../../schemas/backend/account';
import { handleAccountError, parseAccountResponse } from './helpers';

/** Lifts a suspension or a closure; the account can sign in again at once. */
export async function reactivateAccount(
  userId: string,
): Promise<ApiResponse<Account>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await authServerClient().admin.unbanUser({
    userId,
    fetchOptions: { headers: auth.headers, cache: 'no-store' },
  });

  if (error) {
    return handleAccountError<Account>(error);
  }

  return parseAccountResponse(accountSchema, data.user);
}
