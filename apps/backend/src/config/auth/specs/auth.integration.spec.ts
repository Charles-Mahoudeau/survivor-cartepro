import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import {
  grantRole,
  signUp,
  TEST_USER_AGENT,
  TRUSTED_ORIGIN,
  VALID_PASSWORD,
} from '../../../../test/fixtures/user.fixture';
import { api, bodyOf } from '../../../../test/http';
import { truncateRateLimit } from '../../../../test/db/truncate';
import { UserRepo } from '@/modules/user/repos/user.repo';
import { AUTH_BASE_PATH, ROLES } from '../auth.constants';

/** Rounds thrown away so the first hash of the process does not skew a median. */
const TIMING_WARMUP_ROUNDS = 2;

/** Rounds kept. A median over an odd count needs no interpolation. */
const TIMING_SAMPLE_ROUNDS = 7;

/**
 * How far apart the two medians may sit.
 *
 * Measured on this build they land within half a percent of each other, around
 * 54 ms either way, because the library hashes a decoy for an address it does
 * not know. The leak this guards against is the version that skips that hash:
 * an authentication request doing no password work answers in 4 ms, a ratio
 * near fourteen. So the band leaves room for a loaded runner and still sits an
 * order of magnitude short of what it has to catch.
 */
const MAX_TIMING_RATIO = 1.5;

const median = (samples: number[]): number =>
  [...samples].sort((a, b) => a - b)[Math.floor(samples.length / 2)];

let context: TestApp;
const post = (path: string, cookie?: string[]) => {
  const call = api(context.app)
    .post(`${AUTH_BASE_PATH}${path}`)
    .set('Origin', TRUSTED_ORIGIN);
  return cookie ? call.set('Cookie', cookie) : call;
};

const get = (path: string, cookie?: string[]) => {
  const call = api(context.app).get(`${AUTH_BASE_PATH}${path}`);
  return cookie ? call.set('Cookie', cookie) : call;
};

/** An account the administration routes accept, promoted out of band. */
async function anAdministrator(email: string) {
  const account = await signUp(context.app, email);
  await grantRole(context, account.id, ROLES.ADMIN);
  return account;
}

async function roleOf(userId: string): Promise<string> {
  const rows: Array<{ role: string }> = await context.dataSource.query(
    `SELECT role FROM "user" WHERE id = $1`,
    [userId],
  );
  return rows[0].role;
}

async function isBanned(userId: string): Promise<boolean> {
  const rows: Array<{ banned: boolean | null }> =
    await context.dataSource.query(`SELECT banned FROM "user" WHERE id = $1`, [
      userId,
    ]);
  return rows[0].banned === true;
}

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

describe('sign-up', () => {
  it('opens a session and returns the account', async () => {
    const response = await post('/sign-up/email')
      .send({
        name: 'Camille Dupont',
        email: 'camille@tickettout.test',
        password: VALID_PASSWORD,
      })
      .expect(200);

    expect(bodyOf<{ user: unknown }>(response).user).toMatchObject({
      email: 'camille@tickettout.test',
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
        email: 'court@tickettout.test',
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
        email: 'douze@tickettout.test',
        password: 'douzecarac.x',
      })
      .expect(200);
  });

  it('refuses an address that already has an account', async () => {
    await signUp(context.app, 'doublon@tickettout.test');

    await post('/sign-up/email')
      .send({
        name: 'Doublon',
        email: 'doublon@tickettout.test',
        password: VALID_PASSWORD,
      })
      .expect(422);
  });
});

describe('wallet provisioning', () => {
  it('opens exactly one wallet for the new account', async () => {
    const { id } = await signUp(context.app, 'portefeuille@tickettout.test');

    const rows: Array<{
      balance: string;
      currency: string;
      status: string;
      employer_id: string | null;
    }> = await context.dataSource.query(
      `SELECT balance, currency, status, employer_id FROM wallet WHERE user_id = $1`,
      [id],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      balance: '0.00',
      currency: 'EUR',
      status: 'active',
      employer_id: null,
    });
  });
});

describe('roles', () => {
  it('gives a new account the employee role, and only that one', async () => {
    const { id } = await signUp(context.app, 'salarie@tickettout.test');

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
      email: 'escalade@tickettout.test',
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
    const { id } = await signUp(context.app, 'promu@tickettout.test');

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
    await signUp(context.app, 'connu@tickettout.test');

    const wrongPassword = await post('/sign-in/email')
      .send({ email: 'connu@tickettout.test', password: 'mauvaismotdepasse' })
      .expect(401);

    const unknownAccount = await post('/sign-in/email')
      .send({ email: 'inconnu@tickettout.test', password: VALID_PASSWORD })
      .expect(401);

    expect(bodyOf<{ message: string }>(unknownAccount).message).toBe(
      bodyOf<{ message: string }>(wrongPassword).message,
    );
  });

  it('takes as long to refuse a stranger as it does a wrong password', async () => {
    await signUp(context.app, 'connu@tickettout.test');

    const timeRefusal = async (email: string, password: string) => {
      await truncateRateLimit();
      const started = performance.now();
      await post('/sign-in/email').send({ email, password }).expect(401);
      return performance.now() - started;
    };

    const wrongPassword: number[] = [];
    const unknownAccount: number[] = [];

    for (
      let round = 0;
      round < TIMING_WARMUP_ROUNDS + TIMING_SAMPLE_ROUNDS;
      round++
    ) {
      const wrong = await timeRefusal(
        'connu@tickettout.test',
        'mauvaismotdepasse',
      );
      const unknown = await timeRefusal(
        'inconnu@tickettout.test',
        VALID_PASSWORD,
      );

      if (round < TIMING_WARMUP_ROUNDS) {
        continue;
      }

      wrongPassword.push(wrong);
      unknownAccount.push(unknown);
    }

    const wrongMedian = median(wrongPassword);
    const unknownMedian = median(unknownAccount);
    const slower = Math.max(wrongMedian, unknownMedian);
    const faster = Math.min(wrongMedian, unknownMedian);

    expect(slower / faster).toBeLessThan(MAX_TIMING_RATIO);
  }, 60_000);

  it('refuses a banned account with its own message', async () => {
    const { id } = await signUp(context.app, 'banni@tickettout.test');
    await context.dataSource.query(
      `UPDATE "user" SET banned = true WHERE id = $1`,
      [id],
    );

    const response = await post('/sign-in/email')
      .send({ email: 'banni@tickettout.test', password: VALID_PASSWORD })
      .expect(403);

    const refusal = bodyOf<{ code: string; message: string }>(response);
    expect(refusal.code).toBe('BANNED_USER');
    expect(refusal.message).not.toMatch(/invalid|incorrect/i);
  });
});

describe('rate limit', () => {
  it('answers 429 on the sixth attempt within the window', async () => {
    await signUp(context.app, 'brute@tickettout.test');

    const statuses: number[] = [];
    for (let attempt = 1; attempt <= 6; attempt++) {
      const response = await post('/sign-in/email').send({
        email: 'brute@tickettout.test',
        password: 'mauvaismotdepasse',
      });
      statuses.push(response.status);
    }

    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });

  it('cannot be escaped by rotating X-Forwarded-For', async () => {
    await signUp(context.app, 'usurpe@tickettout.test');

    const statuses: number[] = [];
    for (let attempt = 1; attempt <= 6; attempt++) {
      const response = await post('/sign-in/email')
        .set('X-Forwarded-For', `203.0.113.${attempt}`)
        .send({
          email: 'usurpe@tickettout.test',
          password: 'mauvaismotdepasse',
        });
      statuses.push(response.status);
    }

    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });

  it('counts a correct password too, so a valid guess does not reset it', async () => {
    await signUp(context.app, 'melange@tickettout.test');

    for (let attempt = 1; attempt <= 5; attempt++) {
      await post('/sign-in/email').send({
        email: 'melange@tickettout.test',
        password: 'mauvaismotdepasse',
      });
    }

    await post('/sign-in/email')
      .send({ email: 'melange@tickettout.test', password: VALID_PASSWORD })
      .expect(429);
  });
});

describe('sign-out', () => {
  it('deletes the session row and stops resolving the cookie', async () => {
    const account = await signUp(context.app, 'sortie@tickettout.test');

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
    const account = await signUp(context.app, 'csrf@tickettout.test');

    await api(context.app)
      .post(`${AUTH_BASE_PATH}/sign-out`)
      .set('Origin', 'http://attaquant.test')
      .set('Cookie', account.cookie)
      .expect(403);
  });
});

describe('the schema the library writes into', () => {
  it('lands in our snake_case columns, with a version 7 primary key', async () => {
    const account = await signUp(context.app, 'colonnes@tickettout.test');

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
    const account = await signUp(context.app, 'secret@tickettout.test');

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

  it('records the user agent the caller sent', async () => {
    const account = await signUp(context.app, 'trace@tickettout.test');

    const sessions: Array<{ user_agent: string }> =
      await context.dataSource.query(
        `SELECT user_agent FROM session WHERE user_id = $1`,
        [account.id],
      );

    expect(sessions[0].user_agent).toBe(TEST_USER_AGENT);
  });

  it('ignores the address a client puts in X-Forwarded-For', async () => {
    const response = await post('/sign-up/email')
      .set('User-Agent', TEST_USER_AGENT)
      .set('X-Forwarded-For', '198.51.100.7')
      .send({
        name: 'Usurpateur',
        email: 'forge@tickettout.test',
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
    await signUp(context.app, 'compteur@tickettout.test');
    await post('/sign-in/email').send({
      email: 'compteur@tickettout.test',
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

describe('administration routes', () => {
  it('lists the accounts for an administrator', async () => {
    const admin = await anAdministrator('chef@tickettout.test');
    await signUp(context.app, 'salarie@tickettout.test');

    const response = await get('/admin/list-users?limit=10', admin.cookie);
    const { users } = bodyOf<{ users: Array<{ email: string }> }>(response);

    expect(response.status).toBe(200);
    expect(users.map((user) => user.email).sort()).toEqual([
      'chef@tickettout.test',
      'salarie@tickettout.test',
    ]);
  });

  it('refuses the account list to an employee', async () => {
    const employee = await signUp(context.app, 'curieux@tickettout.test');

    const response = await get('/admin/list-users?limit=10', employee.cookie);

    expect(response.status).toBe(403);
  });

  it('changes a role for an administrator', async () => {
    const admin = await anAdministrator('promoteur@tickettout.test');
    const target = await signUp(context.app, 'cible@tickettout.test');

    const response = await post('/admin/set-role', admin.cookie).send({
      userId: target.id,
      role: ROLES.PARTNER,
    });

    expect(response.status).toBe(200);
    expect(await roleOf(target.id)).toBe(ROLES.PARTNER);
  });

  it('refuses to let an employee promote itself to administrator', async () => {
    const employee = await signUp(context.app, 'ambitieux@tickettout.test');

    const response = await post('/admin/set-role', employee.cookie).send({
      userId: employee.id,
      role: ROLES.ADMIN,
    });

    expect(response.status).toBe(403);
    expect(await roleOf(employee.id)).toBe(ROLES.EMPLOYEE);
  });

  it('bans an account for an administrator', async () => {
    const admin = await anAdministrator('gardien@tickettout.test');
    const target = await signUp(context.app, 'fautif@tickettout.test');

    const response = await post('/admin/ban-user', admin.cookie).send({
      userId: target.id,
    });

    expect(response.status).toBe(200);
    expect(await isBanned(target.id)).toBe(true);
  });

  it('refuses banning to an employee', async () => {
    const employee = await signUp(context.app, 'justicier@tickettout.test');
    const target = await signUp(context.app, 'innocent@tickettout.test');

    const response = await post('/admin/ban-user', employee.cookie).send({
      userId: target.id,
    });

    expect(response.status).toBe(403);
    expect(await isBanned(target.id)).toBe(false);
  });
});
