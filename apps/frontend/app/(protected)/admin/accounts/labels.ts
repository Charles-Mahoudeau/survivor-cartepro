import { ADMIN_CONTENT } from '@/content/admin';
import { accountRoleSchema } from '@/lib/api/schemas/backend/account';

/** The label of a role, or a neutral one for a role the space does not know. */
export function accountRoleLabel(role: string | null | undefined): string {
  const parsed = accountRoleSchema.safeParse(role);

  return parsed.success
    ? ADMIN_CONTENT.accounts.roles[parsed.data]
    : ADMIN_CONTENT.accounts.unknownRole;
}
