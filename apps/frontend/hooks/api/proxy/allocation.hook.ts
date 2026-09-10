import 'server-only';

import { forbidden, notFound, redirect } from 'next/navigation';

import { ECODES } from '@/lib/api/clients';
import type { ApiErrorCode } from '@/lib/api/helpers';
import { toHook } from '@/lib/api/helpers/toHook';
import { getAllocation, listAllocations } from '@/lib/api/routes/allocation';
import { listEmployers } from '@/lib/api/routes/employer';
import { throwNextError } from '@/lib/log';

/** Allocations are an administration surface: a wrong role gets the 403 view. */
function navigateOnAuthError(error: ApiErrorCode, name: string): void {
  if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
    redirect('/login');
  }
  if (error === ECODES.FORBIDDEN_ROLE) {
    forbidden();
  }
  throwNextError(new Error(error), `${name} hook returned an error`);
}

export const listAllocationsHook = toHook('listAllocations', listAllocations, {
  onError: (error) => navigateOnAuthError(error, 'listAllocations'),
});

export const getAllocationHook = toHook('getAllocation', getAllocation, {
  onError: (error) => {
    if (error === ECODES.ALLOCATION_NOT_FOUND) {
      notFound();
    }
    navigateOnAuthError(error, 'getAllocation');
  },
});

export const listEmployersHook = toHook('listEmployers', listEmployers, {
  onError: (error) => navigateOnAuthError(error, 'listEmployers'),
});
