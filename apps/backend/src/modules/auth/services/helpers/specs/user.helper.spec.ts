import { ROLES } from '@/config/auth/auth.constants';
import { toSessionUser } from '../user.helper';

const CREATED_AT = new Date('2026-09-02T12:00:00.000Z');

const account = {
  id: 'cfQLay5VOCwEcqDy7GnaYbi8EuzVT2IR',
  email: 'salarie@exemple.fr',
  name: 'Camille Dupont',
  role: ROLES.USER as string,
  emailVerified: false,
  createdAt: CREATED_AT,
};

describe('toSessionUser', () => {
  it('serves the six fields of the contract', () => {
    expect(toSessionUser(account)).toEqual({
      id: 'cfQLay5VOCwEcqDy7GnaYbi8EuzVT2IR',
      email: 'salarie@exemple.fr',
      name: 'Camille Dupont',
      role: ROLES.USER,
      emailVerified: false,
      createdAt: CREATED_AT,
    });
  });

  it('drops every column the projection does not name', () => {
    const withBanColumns = {
      ...account,
      banned: true,
      banReason: 'fraude présumée',
      banExpires: new Date('2026-10-01T00:00:00.000Z'),
      image: 'https://exemple.fr/avatar.png',
      updatedAt: CREATED_AT,
    };

    expect(Object.keys(toSessionUser(withBanColumns)).sort()).toEqual([
      'createdAt',
      'email',
      'emailVerified',
      'id',
      'name',
      'role',
    ]);
  });

  it('falls back to the default role when the column is empty', () => {
    expect(toSessionUser({ ...account, role: null }).role).toBe(ROLES.USER);
    expect(toSessionUser({ ...account, role: undefined }).role).toBe(
      ROLES.USER,
    );
  });

  it('keeps a role it does not know about', () => {
    expect(toSessionUser({ ...account, role: 'partner' }).role).toBe('partner');
  });
});
