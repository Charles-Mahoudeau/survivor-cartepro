import type { INestApplication } from '@nestjs/common';
import type { Role } from '@/config/auth/auth.constants';
import { ROLES } from '@/config/auth/auth.constants';
import { AUTH_BASE_PATH } from '@/config/auth/auth.constants';
import { User } from '@/modules/user/entities';
import type { TestApp } from '../app';
import { api, bodyOf } from '../http';

/** The origin the CSRF check accepts, set by `setup-integration.ts`. */
export const TRUSTED_ORIGIN = 'http://localhost:3000';

export const VALID_PASSWORD = 'correcthorsebatterystaple';

/**
 * Supertest sends no `User-Agent`, where a real client always does. Setting one
 * is not decoration: `session.user_agent` is filled from this header, and
 * without it the column is empty for a reason that belongs to the test client
 * rather than to the code.
 */
export const TEST_USER_AGENT = 'cartepro-integration/1.0';

export interface SignedUpAccount {
  id: string;
  email: string;
  /** Ready to pass to `.set('Cookie', …)`. */
  cookie: string[];
}

/**
 * Creates an account the way a real client does, through the sign-up route.
 *
 * Inserting rows directly would be faster and wrong twice over: a `user` with
 * no `account` row cannot sign in, and hashing a password by hand would be this
 * suite's own second implementation of the thing under test. Going through the
 * route also means the fixture exercises the same path the assertions do, so a
 * broken column mapping fails here rather than three tests later.
 */
export async function signUp(
  app: INestApplication,
  email: string,
  password: string = VALID_PASSWORD,
): Promise<SignedUpAccount> {
  const response = await api(app)
    .post(`${AUTH_BASE_PATH}/sign-up/email`)
    .set('Origin', TRUSTED_ORIGIN)
    .set('User-Agent', TEST_USER_AGENT)
    .send({ name: 'Compte de test', email, password })
    .expect(200);

  const cookie = response.get('Set-Cookie') ?? [];
  const { user } = bodyOf<{ user: { id: string } }>(response);

  return { id: user.id, email, cookie };
}

/**
 * Grants a role out of band, the way the promotion script does.
 *
 * Deliberately not through `/auth/admin/set-role`: that route needs an
 * administrator to already exist, which is the very thing a test setting up the
 * first one cannot assume.
 */
export async function grantRole(
  { dataSource }: TestApp,
  userId: string,
  role: Role,
): Promise<void> {
  await dataSource.getRepository(User).update({ id: userId }, { role });
}

/** Bans an account by writing the columns, leaving its sessions alive. */
export async function banAccount(
  { dataSource }: TestApp,
  userId: string,
  banExpires: Date | null = null,
): Promise<void> {
  await dataSource
    .getRepository(User)
    .update({ id: userId }, { banned: true, banReason: 'test', banExpires });
}

export { ROLES };
