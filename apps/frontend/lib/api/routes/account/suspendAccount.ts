import { getAuth } from '@/lib/auth/cookies';
import { authServerClient } from '@/lib/auth/server';
import { ECODES } from '../../clients';
import type { ApiResponse } from '../../helpers';
import {
  type Account,
  accountSchema,
  type SuspensionDays,
} from '../../schemas/backend/account';
import { handleAccountError, parseAccountResponse } from './helpers';

const SECONDS_PER_DAY = 86_400;

/** Bans an account until the end of the suspension; Better Auth closes its sessions. */
export async function suspendAccount(
  userId: string,
  reason: string,
  days: SuspensionDays,
): Promise<ApiResponse<Account>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const { data, error } = await authServerClient().admin.banUser({
    userId,
    banReason: reason,
    banExpiresIn: days * SECONDS_PER_DAY,
    fetchOptions: { headers: auth.headers, cache: 'no-store' },
  });

  if (error) {
    return handleAccountError<Account>(error);
  }

  return parseAccountResponse(accountSchema, data.user);
}
