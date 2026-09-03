import { ADMIN_ROLES, ROLES, SIGN_IN_RATE_LIMIT } from '../auth.constants';

describe('role constants', () => {
  it('names one role per space of the dispositif', () => {
    expect(Object.values(ROLES)).toEqual(['employee', 'partner', 'admin']);
  });

  it('gives each space a distinct value', () => {
    const values = Object.values(ROLES);
    expect(new Set(values).size).toBe(values.length);
  });

  it('only treats declared roles as administrators, a typo here refusing everyone forever', () => {
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
  it('allows five per minute, so the sixth attempt is the one refused', () => {
    expect(SIGN_IN_RATE_LIMIT.max).toBe(5);
    expect(SIGN_IN_RATE_LIMIT.window).toBe(60);
  });
});
