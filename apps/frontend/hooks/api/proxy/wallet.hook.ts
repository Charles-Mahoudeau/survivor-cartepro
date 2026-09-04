import 'server-only';

import { forbidden, redirect } from 'next/navigation';

import { ECODES } from '@/lib/api/clients';
import type { ApiErrorCode } from '@/lib/api/helpers';
import { toHook } from '@/lib/api/helpers/toHook';
import { getMyWallet, listMyWalletEntries } from '@/lib/api/routes/wallet';
import { throwNextError } from '@/lib/log';

/**
 * A lost session goes back to the sign-in page, a wrong role to the 403 view.
 * `WALLET_NOT_FOUND` is a state the screen renders, not a failure: the hook
 * is optional and answers `null` for it.
 */
function navigateOnAuthError(error: ApiErrorCode, name: string): void {
  if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
    redirect('/login');
  }
  if (error === ECODES.FORBIDDEN_ROLE) {
    forbidden();
  }
  if (error !== ECODES.WALLET_NOT_FOUND) {
    throwNextError(new Error(error), `${name} hook returned an error`);
  }
}

export const getMyWalletHook = toHook('getMyWallet', getMyWallet, {
  optional: true,
  onError: (error) => navigateOnAuthError(error, 'getMyWallet'),
});

export const listMyWalletEntriesHook = toHook(
  'listMyWalletEntries',
  listMyWalletEntries,
  {
    optional: true,
    onError: (error) => navigateOnAuthError(error, 'listMyWalletEntries'),
  },
);
