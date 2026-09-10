import { ROLES, type Role } from '@/lib/auth/constants';

/** Query-string keys of the account list, shared by the server page and its client filters. */
export const ACCOUNTS_SEARCH_PARAM = 'q';
export const ACCOUNTS_ROLE_PARAM = 'role';
export const ACCOUNTS_PAGE_PARAM = 'page';

/** The roles the list can be narrowed to, in the order the filter shows them. */
export const FILTERABLE_ROLES = [
  ROLES.EMPLOYEE,
  ROLES.PARTNER,
  ROLES.ADMIN,
] as const satisfies readonly Role[];
