import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import {
  banAccount,
  grantRole,
  signUp,
  TRUSTED_ORIGIN,
} from '../../../../test/fixtures/user.fixture';
import { api, apiPath, bodyOf } from '../../../../test/http';
import { AUTH_BASE_PATH, ROLES } from '../../../config/auth/auth.constants';

let context: TestApp;
const get = (path: string, cookie?: string[]) => {
  const call = api(context.app).get(path);
  return cookie ? call.set('Cookie', cookie) : call;
};

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('a route with no annotation', () => {
  it('refuses a request that carries no session', async () => {
    const response = await get(apiPath('/probe/any')).expect(401);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'UNAUTHENTICATED',
    );
  });

  it('refuses a session token that resolves to nothing', async () => {
    await get(apiPath('/probe/any'), [
      'better-auth.session_token=nexistepas',
    ]).expect(401);
  });

  it('serves the account behind the cookie', async () => {
    const account = await signUp(context.app, 'salarie@tickettout.test');

    const response = await get(apiPath('/probe/any'), account.cookie).expect(
      200,
    );

    expect(bodyOf<unknown>(response)).toEqual({
      id: account.id,
      email: 'salarie@tickettout.test',
      role: ROLES.EMPLOYEE,
    });
  });

  it('refuses once the session has been signed out', async () => {
    const account = await signUp(context.app, 'sortie@tickettout.test');
    await api(context.app)
      .post(`${AUTH_BASE_PATH}/sign-out`)
      .set('Origin', TRUSTED_ORIGIN)
      .set('Cookie', account.cookie)
      .expect(200);

    await get(apiPath('/probe/any'), account.cookie).expect(401);
  });
});

describe('a route marked public', () => {
  it('answers without a session', async () => {
    await get(apiPath('/probe/open')).expect(200);
  });

  it('covers the health probe, which is the only one in the application', async () => {
    await get('/health').expect(200);
  });
});

describe('a route restricted to a role', () => {
  it('refuses an employee', async () => {
    const account = await signUp(context.app, 'salarie@tickettout.test');

    const response = await get(apiPath('/probe/admin'), account.cookie).expect(
      403,
    );
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('refuses a partner too — the check is a list, not a hierarchy', async () => {
    const account = await signUp(context.app, 'partenaire@tickettout.test');
    await grantRole(context, account.id, ROLES.PARTNER);

    await get(apiPath('/probe/admin'), account.cookie).expect(403);
  });

  it('serves an administrator', async () => {
    const account = await signUp(context.app, 'agent@tickettout.test');
    await grantRole(context, account.id, ROLES.ADMIN);

    const response = await get(apiPath('/probe/admin'), account.cookie).expect(
      200,
    );
    expect(bodyOf<{ role: string }>(response).role).toBe(ROLES.ADMIN);
  });

  it('takes a promotion into account on the very next request, same cookie', async () => {
    const account = await signUp(context.app, 'promu@tickettout.test');
    await get(apiPath('/probe/admin'), account.cookie).expect(403);

    await grantRole(context, account.id, ROLES.ADMIN);

    await get(apiPath('/probe/admin'), account.cookie).expect(200);
  });

  it('takes a demotion into account just as fast', async () => {
    const account = await signUp(context.app, 'retrograde@tickettout.test');
    await grantRole(context, account.id, ROLES.ADMIN);
    await get(apiPath('/probe/admin'), account.cookie).expect(200);

    await grantRole(context, account.id, ROLES.EMPLOYEE);

    await get(apiPath('/probe/admin'), account.cookie).expect(403);
  });
});

describe('a banned account', () => {
  it('is refused on a session that predates a ban written straight onto the columns', async () => {
    const account = await signUp(context.app, 'banni@tickettout.test');
    await get(apiPath('/probe/any'), account.cookie).expect(200);

    await banAccount(context, account.id);

    const response = await get(apiPath('/probe/any'), account.cookie).expect(
      403,
    );
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'ACCOUNT_BANNED',
    );
  });

  it('is let back in once the ban has expired', async () => {
    const account = await signUp(context.app, 'expire@tickettout.test');
    await banAccount(context, account.id, new Date(Date.now() - 60_000));

    await get(apiPath('/probe/any'), account.cookie).expect(200);
  });

  it('stays out while the ban still has time to run', async () => {
    const account = await signUp(context.app, 'encore@tickettout.test');
    await banAccount(context, account.id, new Date(Date.now() + 60_000));

    await get(apiPath('/probe/any'), account.cookie).expect(403);
  });
});
