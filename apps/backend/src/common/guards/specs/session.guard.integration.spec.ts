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
import { api, bodyOf } from '../../../../test/http';
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
    const response = await get('/probe/any').expect(401);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'UNAUTHENTICATED',
    );
  });

  it('refuses a session token that resolves to nothing', async () => {
    await get('/probe/any', ['better-auth.session_token=nexistepas']).expect(
      401,
    );
  });

  it('serves the account behind the cookie', async () => {
    const account = await signUp(context.app, 'salarie@cartepro.test');

    const response = await get('/probe/any', account.cookie).expect(200);

    expect(bodyOf<unknown>(response)).toEqual({
      id: account.id,
      email: 'salarie@cartepro.test',
      role: ROLES.EMPLOYEE,
    });
  });

  it('refuses once the session has been signed out', async () => {
    const account = await signUp(context.app, 'sortie@cartepro.test');
    await api(context.app)
      .post(`${AUTH_BASE_PATH}/sign-out`)
      .set('Origin', TRUSTED_ORIGIN)
      .set('Cookie', account.cookie)
      .expect(200);

    await get('/probe/any', account.cookie).expect(401);
  });
});

describe('a route marked public', () => {
  it('answers without a session', async () => {
    await get('/probe/open').expect(200);
  });

  it('covers the health probe, which is the only one in the application', async () => {
    await get('/health').expect(200);
  });
});

describe('a route restricted to a role', () => {
  it('refuses an employee', async () => {
    const account = await signUp(context.app, 'salarie@cartepro.test');

    const response = await get('/probe/admin', account.cookie).expect(403);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('refuses a partner too — the check is a list, not a hierarchy', async () => {
    const account = await signUp(context.app, 'partenaire@cartepro.test');
    await grantRole(context, account.id, ROLES.PARTNER);

    await get('/probe/admin', account.cookie).expect(403);
  });

  it('serves an administrator', async () => {
    const account = await signUp(context.app, 'agent@cartepro.test');
    await grantRole(context, account.id, ROLES.ADMIN);

    const response = await get('/probe/admin', account.cookie).expect(200);
    expect(bodyOf<{ role: string }>(response).role).toBe(ROLES.ADMIN);
  });

  it('takes a promotion into account on the very next request', async () => {
    const account = await signUp(context.app, 'promu@cartepro.test');
    await get('/probe/admin', account.cookie).expect(403);

    await grantRole(context, account.id, ROLES.ADMIN);

    // No new sign-in, the same cookie: this is what the absence of a session
    // cookie cache buys. With one, the old role would answer until it expired.
    await get('/probe/admin', account.cookie).expect(200);
  });

  it('takes a demotion into account just as fast', async () => {
    const account = await signUp(context.app, 'retrograde@cartepro.test');
    await grantRole(context, account.id, ROLES.ADMIN);
    await get('/probe/admin', account.cookie).expect(200);

    await grantRole(context, account.id, ROLES.EMPLOYEE);

    await get('/probe/admin', account.cookie).expect(403);
  });
});

describe('a banned account', () => {
  it('is refused on a session that predates the ban', async () => {
    const account = await signUp(context.app, 'banni@cartepro.test');
    await get('/probe/any', account.cookie).expect(200);

    // Written straight onto the columns, the way a data fix or a script would.
    // The plugin's own ban route revokes the sessions, so it never reaches this
    // branch — this is the case the guard exists for.
    await banAccount(context, account.id);

    const response = await get('/probe/any', account.cookie).expect(403);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'ACCOUNT_BANNED',
    );
  });

  it('is let back in once the ban has expired', async () => {
    const account = await signUp(context.app, 'expire@cartepro.test');
    await banAccount(context, account.id, new Date(Date.now() - 60_000));

    await get('/probe/any', account.cookie).expect(200);
  });

  it('stays out while the ban still has time to run', async () => {
    const account = await signUp(context.app, 'encore@cartepro.test');
    await banAccount(context, account.id, new Date(Date.now() + 60_000));

    await get('/probe/any', account.cookie).expect(403);
  });
});
