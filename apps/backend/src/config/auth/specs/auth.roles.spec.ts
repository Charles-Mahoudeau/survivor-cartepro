import { ADMIN_ROLES, ROLES, SIGN_IN_RATE_LIMIT } from '../auth.constants';

describe('role constants', () => {
  it('names one role per space of the dispositif', () => {
    expect(Object.values(ROLES)).toEqual(['employee', 'partner', 'admin']);
  });

  it('gives each space a distinct value', () => {
    const values = Object.values(ROLES);
    expect(new Set(values).size).toBe(values.length);
  });

  it('only treats declared roles as administrators', () => {
    // A typo here does not fail anywhere: the guard would simply never match,
    // and every administration route would answer 403 to everyone, forever.
    const declared: readonly string[] = Object.values(ROLES);
    for (const role of ADMIN_ROLES) {
      expect(declared).toContain(role);
    }
  });

  it('does not hand administration to the role sign-up assigns', () => {
    const adminRoles: readonly string[] = ADMIN_ROLES;
    expect(adminRoles).not.toContain(ROLES.EMPLOYEE);
    expect(adminRoles).not.toContain(ROLES.PARTNER);
  });
});

describe('sign-in rate limit', () => {
  it('lets the sixth attempt of a minute be the one refused', () => {
    // The acceptance criterion is phrased on the sixth attempt, the option on
    // the number allowed. Off by one here and the suite still passes while the
    // criterion does not.
    expect(SIGN_IN_RATE_LIMIT.max).toBe(5);
    expect(SIGN_IN_RATE_LIMIT.window).toBe(60);
  });
});
