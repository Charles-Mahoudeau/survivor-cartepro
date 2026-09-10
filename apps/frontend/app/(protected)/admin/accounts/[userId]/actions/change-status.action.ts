'use server';

import { revalidatePath } from 'next/cache';

import { ApiError } from '@/lib/api/helpers';
import {
  closeAccount,
  reactivateAccount,
  suspendAccount,
} from '@/lib/api/routes/account';
import {
  type AccountStatusChange,
  accountStatusChangeSchema,
} from '@/lib/api/schemas/backend/account';
import { actionClient } from '@/lib/safe-action';

function applyStatusChange(change: AccountStatusChange) {
  switch (change.action) {
    case 'suspend':
      return suspendAccount(change.userId, change.reason, change.days);
    case 'close':
      return closeAccount(change.userId, change.reason);
    case 'reactivate':
      return reactivateAccount(change.userId);
  }
}

/** Suspends, closes or reactivates an account; a ban also ends every session it holds. */
export const changeAccountStatusAction = actionClient
  .inputSchema(accountStatusChangeSchema)
  .action(async ({ parsedInput }) => {
    const { data, error } = await applyStatusChange(parsedInput);

    if (error) {
      throw new ApiError(error);
    }

    revalidatePath('/admin/accounts');
    revalidatePath(`/admin/accounts/${parsedInput.userId}`);

    return data;
  });
