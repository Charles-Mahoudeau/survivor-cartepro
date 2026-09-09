import { APIError } from 'better-auth/api';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import {
  classifyUserUpdateAction,
  isFailedSignIn,
  readAttemptedEmail,
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

const SIGN_IN_PATH = '/sign-in/email';
const REJECTION = new APIError('UNAUTHORIZED', { message: 'Invalid email' });
const SESSION = { token: 'a-token', user: { id: USER_ID } };

describe('isFailedSignIn', () => {
  it('reads a rejected sign-in from the error the endpoint returned', () => {
    expect(isFailedSignIn(SIGN_IN_PATH, REJECTION)).toBe(true);
  });

  it('leaves a successful sign-in alone', () => {
    expect(isFailedSignIn(SIGN_IN_PATH, SESSION)).toBe(false);
  });

  it('leaves a sign-in that returned nothing alone', () => {
    expect(isFailedSignIn(SIGN_IN_PATH, undefined)).toBe(false);
  });

  it('ignores failures on every other endpoint', () => {
    expect(isFailedSignIn('/sign-up/email', REJECTION)).toBe(false);
    expect(isFailedSignIn('/admin/set-role', REJECTION)).toBe(false);
  });
});

describe('readAttemptedEmail', () => {
  it('reads the address someone tried to sign in as', () => {
    expect(readAttemptedEmail({ email: 'camille@example.test' })).toBe(
      'camille@example.test',
    );
  });

  it('never reaches for anything but the address', () => {
    expect(
      readAttemptedEmail({ email: 'camille@example.test', password: 'secret' }),
    ).toBe('camille@example.test');
  });

  it('returns null when the body carries no address', () => {
    expect(readAttemptedEmail({ password: 'secret' })).toBeNull();
    expect(readAttemptedEmail({})).toBeNull();
  });

  it('returns null when the address is not a string', () => {
    expect(readAttemptedEmail({ email: 42 })).toBeNull();
    expect(readAttemptedEmail({ email: null })).toBeNull();
    expect(readAttemptedEmail({ email: { address: 'a@b.test' } })).toBeNull();
  });

  it('returns null when there is no body at all', () => {
    expect(readAttemptedEmail(undefined)).toBeNull();
    expect(readAttemptedEmail(null)).toBeNull();
    expect(readAttemptedEmail('email=camille@example.test')).toBeNull();
  });
});
