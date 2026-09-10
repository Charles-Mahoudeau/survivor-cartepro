import type { Account } from '@/lib/api/schemas/backend/account';

/** Where an account stands, read from the ban fields Better Auth keeps. */
export type AccountStatus = 'active' | 'suspended' | 'closed';

/** An account as the list shows it, with the status the server derived. */
export type ListedAccount = Account & { status: AccountStatus };

/** A ban with no end date is a closure; one whose end has strictly passed no longer holds. */
export function accountStatusOf(
  account: Pick<Account, 'banned' | 'banExpires'>,
  now: Date = new Date(),
): AccountStatus {
  if (!account.banned) {
    return 'active';
  }
  if (!account.banExpires) {
    return 'closed';
  }
  return new Date(account.banExpires).getTime() < now.getTime()
    ? 'active'
    : 'suspended';
}
