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

/** `session.user_agent` is filled from this header; supertest sends none. */
export const TEST_USER_AGENT = 'tickettout-integration/1.0';

export interface SignedUpAccount {
  id: string;
  email: string;
  /** Ready to pass to `.set('Cookie', …)`. */
  cookie: string[];
}

/**
 * Creates an account through the sign-up route. Inserting rows directly would
 * be wrong twice: a `user` with no `account` cannot sign in, and hashing by
 * hand would be a second implementation of the thing under test.
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
 * Writes the account row alone, for someone a spec only ever needs as the
 * holder of something. It carries no `account` row, so it cannot sign in — use
 * `signUp` for anyone who has to. Sign-up is rate limited per address, and a
 * spec that seeds a dozen wallet holders through it hits the limit.
 */
export async function createUser(
  { dataSource }: TestApp,
  name: string,
  email: string,
): Promise<{ id: string }> {
  const saved = await dataSource.getRepository(User).save({ name, email });
  return { id: saved.id };
}

/**
 * Grants a role out of band, like the promotion script. Not through
 * `/auth/admin/set-role`, which needs an administrator to already exist.
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
