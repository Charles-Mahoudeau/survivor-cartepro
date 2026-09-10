import 'server-only';

import { forbidden, notFound, redirect } from 'next/navigation';

import { ECODES } from '@/lib/api/clients';
import type { ApiErrorCode } from '@/lib/api/helpers';
import { toHook } from '@/lib/api/helpers/toHook';
import { getAccount, listAccounts } from '@/lib/api/routes/account';
import { throwNextError } from '@/lib/log';

function navigateOnAuthError(error: ApiErrorCode, name: string): void {
  if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
    redirect('/login');
  }
  if (error === ECODES.FORBIDDEN_ROLE) {
    forbidden();
  }
  throwNextError(new Error(error), `${name} hook returned an error`);
}

/** The accounts of the dispositif, for the administration only. */
export const listAccountsHook = toHook('listAccounts', listAccounts, {
  onError: (error) => navigateOnAuthError(error, 'listAccounts'),
});

/** One account, or the 404 view when the identifier matches none. */
export const getAccountHook = toHook('getAccount', getAccount, {
  onError: (error) => {
    if (error === ECODES.ACCOUNT_NOT_FOUND) {
      notFound();
    }
    navigateOnAuthError(error, 'getAccount');
  },
});
