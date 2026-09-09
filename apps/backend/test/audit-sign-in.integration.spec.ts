import { Audit } from '@/modules/audit/entities';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { AUTH_BASE_PATH } from '@/config/auth/auth.constants';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from './app';
import {
  signUp,
  TRUSTED_ORIGIN,
  TEST_USER_AGENT,
  VALID_PASSWORD,
} from './fixtures/user.fixture';
import { api } from './http';

let context: TestApp;

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

const WRONG_PASSWORD = 'mauvaismotdepasse';

function signIn(email: string, password: string) {
  return api(context.app)
    .post(`${AUTH_BASE_PATH}/sign-in/email`)
    .set('Origin', TRUSTED_ORIGIN)
    .set('User-Agent', TEST_USER_AGENT)
    .send({ email, password });
}

function readSignInFailures(): Promise<Audit[]> {
  return context.dataSource
    .getRepository(Audit)
    .find({ where: { action: AuditAction.LOGIN_FAILED } });
}

describe('failed sign-in auditing', () => {
  it('records the rejected attempt with the address it was made under', async () => {
    const email = `rejete-${Date.now()}@tickettout.test`;
    await signUp(context.app, email);

    await signIn(email, WRONG_PASSWORD).expect(401);

    const entries = await readSignInFailures();
    expect(entries).toHaveLength(1);
    expect(entries[0].payload).toEqual({ email });
    expect(entries[0].targetType).toBe('user');
  });

  it('leaves no actor on the entry, since nobody was authenticated', async () => {
    const email = `anonyme-${Date.now()}@tickettout.test`;
    await signUp(context.app, email);

    await signIn(email, WRONG_PASSWORD).expect(401);

    const [entry] = await readSignInFailures();
    expect(entry.actorId).toBeNull();
    expect(entry.actorRole).toBeNull();
    expect(entry.targetId).toBeNull();
  });

  it('never lets the attempted credentials into the entry', async () => {
    const email = `secret-${Date.now()}@tickettout.test`;
    await signUp(context.app, email);

    await signIn(email, WRONG_PASSWORD).expect(401);

    const [entry] = await readSignInFailures();
    expect(JSON.stringify(entry)).not.toContain(WRONG_PASSWORD);
    expect(JSON.stringify(entry)).not.toContain(VALID_PASSWORD);
  });

  it('records an attempt on an address that has no account', async () => {
    const email = `fantome-${Date.now()}@tickettout.test`;

    await signIn(email, VALID_PASSWORD).expect(401);

    const entries = await readSignInFailures();
    expect(entries).toHaveLength(1);
    expect(entries[0].payload).toEqual({ email });
  });

  it('writes nothing when the credentials are right', async () => {
    const email = `admis-${Date.now()}@tickettout.test`;
    await signUp(context.app, email);

    await signIn(email, VALID_PASSWORD).expect(200);

    expect(await readSignInFailures()).toHaveLength(0);
  });

  it('counts one entry per rejected attempt', async () => {
    const email = `repete-${Date.now()}@tickettout.test`;
    await signUp(context.app, email);

    await signIn(email, WRONG_PASSWORD).expect(401);
    await signIn(email, WRONG_PASSWORD).expect(401);
    await signIn(email, WRONG_PASSWORD).expect(401);

    expect(await readSignInFailures()).toHaveLength(3);
  });
});
