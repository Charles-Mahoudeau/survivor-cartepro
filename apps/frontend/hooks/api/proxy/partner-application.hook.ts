import 'server-only';

import { forbidden, notFound, redirect } from 'next/navigation';

import { ECODES } from '@/lib/api/clients';
import type { ApiErrorCode } from '@/lib/api/helpers';
import { toHook } from '@/lib/api/helpers/toHook';
import {
  getApplication,
  listApplications,
} from '@/lib/api/routes/partner-application';
import { throwNextError } from '@/lib/log';

/** The review queue is an administration surface: a wrong role gets the 403 view. */
function navigateOnAuthError(error: ApiErrorCode, name: string): void {
  if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
    redirect('/login');
  }
  if (error === ECODES.FORBIDDEN_ROLE) {
    forbidden();
  }
  throwNextError(new Error(error), `${name} hook returned an error`);
}

export const listApplicationsHook = toHook(
  'listApplications',
  listApplications,
  {
    onError: (error) => navigateOnAuthError(error, 'listApplications'),
  },
);

export const getApplicationHook = toHook('getApplication', getApplication, {
  onError: (error) => {
    if (error === ECODES.PARTNER_NOT_FOUND) {
      notFound();
    }
    navigateOnAuthError(error, 'getApplication');
  },
});
