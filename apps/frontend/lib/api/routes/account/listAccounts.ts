import { getAuth } from '@/lib/auth/cookies';
import { authServerClient } from '@/lib/auth/server';
import { ECODES } from '../../clients';
import type { ApiResponse } from '../../helpers';
import {
  ACCOUNTS_PAGE_SIZE,
  type AccountPage,
  accountPageSchema,
  type ListAccountsQuery,
} from '../../schemas/backend/account';
import { handleAccountError, parseAccountResponse } from './helpers';

/** One page of accounts, newest first. Never cached: a status change shows at once. */
export async function listAccounts(
  query: ListAccountsQuery,
): Promise<ApiResponse<AccountPage>> {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return { data: null, error: ECODES.UNAUTHENTICATED };
  }

  const page = query.page ?? 1;

  const { data, error } = await authServerClient().admin.listUsers({
    query: {
      limit: ACCOUNTS_PAGE_SIZE,
      offset: (page - 1) * ACCOUNTS_PAGE_SIZE,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      searchValue: query.search,
      searchField: 'email',
      searchOperator: 'contains',
      filterField: query.role ? 'role' : undefined,
      filterValue: query.role,
      filterOperator: query.role ? 'eq' : undefined,
    },
    fetchOptions: { headers: auth.headers, cache: 'no-store' },
  });

  if (error) {
    return handleAccountError<AccountPage>(error);
  }

  return parseAccountResponse(accountPageSchema, data);
}
