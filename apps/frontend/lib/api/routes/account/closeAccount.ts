import { getAuth } from '@/lib/auth/cookies';
import { authServerClient } from '@/lib/auth/server';
import { ECODES } from '../../clients';
import type { ApiResponse } from '../../helpers';
import { type Account, accountSchema } from '../../schemas/backend/account';
import { handleAccountError, parseAccountResponse } from './helpers';

/** Bans an account with no end date; nothing is deleted, its history stays. */
export async function closeAccount(
  userId: string,
  reason: string,
): Promise<ApiResponse<Account>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await authServerClient().admin.banUser({
    userId,
    banReason: reason,
    fetchOptions: { headers: auth.headers, cache: 'no-store' },
  });

  if (error) {
    return handleAccountError<Account>(error);
  }

  return parseAccountResponse(accountSchema, data.user);
}
