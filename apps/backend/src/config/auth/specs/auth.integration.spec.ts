import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import {
  signUp,
  TEST_USER_AGENT,
  TRUSTED_ORIGIN,
  VALID_PASSWORD,
} from '../../../../test/fixtures/user.fixture';
import { api, bodyOf } from '../../../../test/http';
import { UserRepo } from '@/modules/user/repos/user.repo';
import { AUTH_BASE_PATH, ROLES } from '../auth.constants';

let context: TestApp;
const post = (path: string) =>
  api(context.app)
    .post(`${AUTH_BASE_PATH}${path}`)
    .set('Origin', TRUSTED_ORIGIN);

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('sign-up', () => {
  it('opens a session and returns the account', async () => {
    const response = await post('/sign-up/email')
      .send({
        name: 'Camille Dupont',
        email: 'camille@cartepro.test',
        password: VALID_PASSWORD,
      })
      .expect(200);

    expect(bodyOf<{ user: unknown }>(response).user).toMatchObject({
      email: 'camille@cartepro.test',
      name: 'Camille Dupont',
      emailVerified: false,
    });
    expect(response.get('Set-Cookie')?.join()).toContain(
      'better-auth.session_token',
    );
  });

  it('refuses a password of eleven characters', async () => {
    await post('/sign-up/email')
      .send({
        name: 'Trop court',
        email: 'court@cartepro.test',
        password: 'onzecarac.x',
      })
      .expect(400)
      .expect((response) =>
        expect(bodyOf<{ code: string }>(response).code).toBe(
          'PASSWORD_TOO_SHORT',
        ),
      );
  });

  it('accepts exactly twelve', async () => {
    await post('/sign-up/email')
      .send({
        name: 'Juste assez',
        email: 'douze@cartepro.test',
        password: 'douzecarac.x',
      })
      .expect(200);
  });

  it('refuses an address that already has an account', async () => {
    await signUp(context.app, 'doublon@cartepro.test');

    await post('/sign-up/email')
      .send({
        name: 'Doublon',
        email: 'doublon@cartepro.test',
        password: VALID_PASSWORD,
      })
      .expect(422);
  });
});

describe('roles', () => {
  it('gives a new account the employee role, and only that one', async () => {
    const { id } = await signUp(context.app, 'salarie@cartepro.test');

    const rows: Array<{ role: string }> = await context.dataSource.query(
      `SELECT role FROM "user" WHERE id = $1`,
      [id],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].role).toBe(ROLES.EMPLOYEE);
  });

  it('never lets the request choose its own role, whether it is refused or ignored', async () => {
    await post('/sign-up/email').send({
      name: 'Opportuniste',
      email: 'escalade@cartepro.test',
      password: VALID_PASSWORD,
      role: ROLES.ADMIN,
    });

    const admins: Array<{ email: string }> = await context.dataSource.query(
      `SELECT email FROM "user" WHERE role = $1`,
      [ROLES.ADMIN],
    );

    expect(admins).toEqual([]);
  });

  it('replaces the role rather than accumulating one, through the code that grants it', async () => {
    const { id } = await signUp(context.app, 'promu@cartepro.test');

    await context.app.get(UserRepo).setRole(id, ROLES.ADMIN);

    const rows: Array<{ role: string }> = await context.dataSource.query(
      `SELECT role FROM "user" WHERE id = $1`,
      [id],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].role).toBe(ROLES.ADMIN);
  });
});

describe('sign-in', () => {
  it('answers a wrong password and a stranger identically, so accounts cannot be enumerated', async () => {
    await signUp(context.app, 'connu@cartepro.test');

    const wrongPassword = await post('/sign-in/email')
      .send({ email: 'connu@cartepro.test', password: 'mauvaismotdepasse' })
      .expect(401);

    const unknownAccount = await post('/sign-in/email')
      .send({ email: 'inconnu@cartepro.test', password: VALID_PASSWORD })
      .expect(401);

    expect(bodyOf<{ message: string }>(unknownAccount).message).toBe(
      bodyOf<{ message: string }>(wrongPassword).message,
    );
  });

  it('refuses a banned account with its own message', async () => {
    const { id } = await signUp(context.app, 'banni@cartepro.test');
    await context.dataSource.query(
      `UPDATE "user" SET banned = true WHERE id = $1`,
      [id],
    );

    const response = await post('/sign-in/email')
      .send({ email: 'banni@cartepro.test', password: VALID_PASSWORD })
      .expect(403);

    const refusal = bodyOf<{ code: string; message: string }>(response);
    expect(refusal.code).toBe('BANNED_USER');
    expect(refusal.message).not.toMatch(/invalid|incorrect/i);
  });
});

describe('rate limit', () => {
  it('answers 429 on the sixth attempt within the window', async () => {
    await signUp(context.app, 'brute@cartepro.test');

    const statuses: number[] = [];
    for (let attempt = 1; attempt <= 6; attempt++) {
      const response = await post('/sign-in/email').send({
        email: 'brute@cartepro.test',
        password: 'mauvaismotdepasse',
      });
      statuses.push(response.status);
    }

    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });

  it('cannot be escaped by rotating X-Forwarded-For', async () => {
    await signUp(context.app, 'usurpe@cartepro.test');

    const statuses: number[] = [];
    for (let attempt = 1; attempt <= 6; attempt++) {
      const response = await post('/sign-in/email')
        .set('X-Forwarded-For', `203.0.113.${attempt}`)
        .send({ email: 'usurpe@cartepro.test', password: 'mauvaismotdepasse' });
      statuses.push(response.status);
    }

    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });

  it('counts a correct password too, so a valid guess does not reset it', async () => {
    await signUp(context.app, 'melange@cartepro.test');

    for (let attempt = 1; attempt <= 5; attempt++) {
      await post('/sign-in/email').send({
        email: 'melange@cartepro.test',
        password: 'mauvaismotdepasse',
      });
    }

    await post('/sign-in/email')
      .send({ email: 'melange@cartepro.test', password: VALID_PASSWORD })
      .expect(429);
  });
});

describe('sign-out', () => {
  it('deletes the session row and stops resolving the cookie', async () => {
    const account = await signUp(context.app, 'sortie@cartepro.test');

    const before: Array<{ count: string }> = await context.dataSource.query(
      `SELECT count(*) FROM session WHERE user_id = $1`,
      [account.id],
    );
    expect(before[0].count).toBe('1');

    await post('/sign-out').set('Cookie', account.cookie).expect(200);

    const after: Array<{ count: string }> = await context.dataSource.query(
      `SELECT count(*) FROM session WHERE user_id = $1`,
      [account.id],
    );
    expect(after[0].count).toBe('0');

    const session = await api(context.app)
      .get(`${AUTH_BASE_PATH}/get-session`)
      .set('Cookie', account.cookie)
      .expect(200);
    expect(bodyOf<unknown>(session)).toBeNull();
  });

  it('refuses a state-changing call from an untrusted origin', async () => {
    const account = await signUp(context.app, 'csrf@cartepro.test');

    await api(context.app)
      .post(`${AUTH_BASE_PATH}/sign-out`)
      .set('Origin', 'http://attaquant.test')
      .set('Cookie', account.cookie)
      .expect(403);
  });
});

describe('the schema the library writes into', () => {
  it('lands in our snake_case columns, with a version 7 primary key', async () => {
    const account = await signUp(context.app, 'colonnes@cartepro.test');

    const rows: Array<{
      id: string;
      email_verified: boolean;
      created_at: Date;
    }> = await context.dataSource.query(
      `SELECT id, email_verified, created_at FROM "user" WHERE id = $1`,
      [account.id],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].email_verified).toBe(false);
    expect(rows[0].created_at).toBeInstanceOf(Date);
    expect(rows[0].id[14]).toBe('7');
  });

  it('keeps the password in its own table, never on the account', async () => {
    const account = await signUp(context.app, 'secret@cartepro.test');

    const credentials: Array<{ password: string; provider_id: string }> =
      await context.dataSource.query(
        `SELECT password, provider_id FROM account WHERE user_id = $1`,
        [account.id],
      );

    expect(credentials).toHaveLength(1);
    expect(credentials[0].provider_id).toBe('credential');
    expect(credentials[0].password).not.toContain(VALID_PASSWORD);

    const columns: Array<{ column_name: string }> =
      await context.dataSource.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = 'user' AND column_name = 'password'`,
      );
    expect(columns).toEqual([]);
  });

  it('records the address the middleware resolved, not one a client can claim', async () => {
    const account = await signUp(context.app, 'trace@cartepro.test');

    const sessions: Array<{ ip_address: string; user_agent: string }> =
      await context.dataSource.query(
        `SELECT ip_address, user_agent FROM session WHERE user_id = $1`,
        [account.id],
      );

    expect(sessions[0].ip_address).toBe('127.0.0.1');
    expect(sessions[0].user_agent).toBe(TEST_USER_AGENT);
  });

  it('ignores the address a client puts in X-Forwarded-For', async () => {
    const response = await post('/sign-up/email')
      .set('User-Agent', TEST_USER_AGENT)
      .set('X-Forwarded-For', '198.51.100.7')
      .send({
        name: 'Usurpateur',
        email: 'forge@cartepro.test',
        password: VALID_PASSWORD,
      })
      .expect(200);

    const { user } = bodyOf<{ user: { id: string } }>(response);
    const sessions: Array<{ ip_address: string }> =
      await context.dataSource.query(
        `SELECT ip_address FROM session WHERE user_id = $1`,
        [user.id],
      );

    expect(sessions[0].ip_address).not.toBe('198.51.100.7');
    expect(sessions[0].ip_address).toBe('127.0.0.1');
  });

  it('counts sign-in attempts in the rate limit table', async () => {
    await signUp(context.app, 'compteur@cartepro.test');
    await post('/sign-in/email').send({
      email: 'compteur@cartepro.test',
      password: 'mauvaismotdepasse',
    });

    const counters: Array<{ key: string }> = await context.dataSource.query(
      `SELECT key FROM rate_limit`,
    );

    expect(counters.some((row) => row.key.includes('/sign-in/email'))).toBe(
      true,
    );
  });

  it('has the api key table the third-party surface will use', async () => {
    const tables: Array<{ table_name: string }> =
      await context.dataSource.query(
        `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'api_key'`,
      );

    expect(tables).toHaveLength(1);
  });
});
