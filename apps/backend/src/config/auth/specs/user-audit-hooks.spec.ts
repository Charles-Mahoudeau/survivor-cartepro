import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import {
  classifyUserUpdateAction,
  type UserUpdateAuditContext,
} from '../user-audit-hooks';

const USER_ID = 'a-user-id';
const OTHER_ID = 'another-user-id';

function context(overrides: Partial<UserUpdateAuditContext> = {}) {
  return {
    path: null,
    actorId: null,
    actorRole: null,
    ...overrides,
  };
}

describe('classifyUserUpdateAction', () => {
  it('reads a role change from /admin/set-role, whoever the caller is', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/admin/set-role', actorId: OTHER_ID }),
      ),
    ).toBe(AuditAction.ROLE_CHANGED);
  });

  it('reads a ban as an administrative action', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/admin/ban-user', actorId: OTHER_ID }),
      ),
    ).toBe(AuditAction.ADMIN_ACTION);
  });

  it('reads an unban as an administrative action', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/admin/unban-user', actorId: OTHER_ID }),
      ),
    ).toBe(AuditAction.ADMIN_ACTION);
  });

  it('reads an admin editing someone else as an administrative action', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/admin/update-user', actorId: OTHER_ID }),
      ),
    ).toBe(AuditAction.ADMIN_ACTION);
  });

  it('reads an account editing itself as ACCOUNT_UPDATED', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/update-user', actorId: USER_ID }),
      ),
    ).toBe(AuditAction.ACCOUNT_UPDATED);
  });

  it('reads a write with no caller as ACCOUNT_UPDATED, not an admin action', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/reset-password', actorId: null }),
      ),
    ).toBe(AuditAction.ACCOUNT_UPDATED);
  });

  it('reads a write with no recognised path as ACCOUNT_UPDATED when self-triggered', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/change-password', actorId: USER_ID }),
      ),
    ).toBe(AuditAction.ACCOUNT_UPDATED);
  });

  it('takes the role change branch even without a caller identified', () => {
    expect(
      classifyUserUpdateAction(
        USER_ID,
        context({ path: '/admin/set-role', actorId: null }),
      ),
    ).toBe(AuditAction.ROLE_CHANGED);
  });
});
