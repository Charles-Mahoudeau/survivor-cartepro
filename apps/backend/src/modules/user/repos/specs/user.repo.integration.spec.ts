import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { signUp } from '../../../../../test/fixtures/user.fixture';
import { ROLES } from '../../../../config/auth/auth.constants';
import { Wallet } from '../../../wallets/entities/wallet.entity';
import { User } from '../../entities';
import { UserRepo } from '../user.repo';

let context: TestApp;
let users: UserRepo;

beforeAll(async () => {
  context = await createTestApp();
  users = context.app.get(UserRepo);
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

describe('findById', () => {
  it('returns the account', async () => {
    const account = await signUp(context.app, 'trouve@tickettout.test');

    const found = await users.findById(account.id);

    expect(found?.email).toBe('trouve@tickettout.test');
    expect(found?.role).toBe(ROLES.EMPLOYEE);
  });

  it('returns null for an id that matches nothing', async () => {
    expect(
      await users.findById('01a062a4-0000-7000-8000-000000000000'),
    ).toBeNull();
  });
});

describe('findByEmail', () => {
  it('returns the account', async () => {
    await signUp(context.app, 'par.email@tickettout.test');

    expect((await users.findByEmail('par.email@tickettout.test'))?.email).toBe(
      'par.email@tickettout.test',
    );
  });

  it('returns null for an address nobody uses', async () => {
    expect(await users.findByEmail('personne@tickettout.test')).toBeNull();
  });
});

describe('findManyByIds', () => {
  it('resolves several accounts in one call', async () => {
    const first = await signUp(context.app, 'un@tickettout.test');
    const second = await signUp(context.app, 'deux@tickettout.test');
    await signUp(context.app, 'trois@tickettout.test');

    const found = await users.findManyByIds([first.id, second.id]);

    expect(found.map((user) => user.email).sort()).toEqual([
      'deux@tickettout.test',
      'un@tickettout.test',
    ]);
  });

  it('returns nothing for an empty list rather than asking for `IN ()`', async () => {
    await signUp(context.app, 'present@tickettout.test');

    expect(await users.findManyByIds([])).toEqual([]);
  });

  it('ignores an id that matches nothing instead of failing', async () => {
    const account = await signUp(context.app, 'melange@tickettout.test');

    const found = await users.findManyByIds([
      account.id,
      '01a062a4-0000-7000-8000-000000000000',
    ]);

    expect(found).toHaveLength(1);
  });
});

describe('setRole', () => {
  it('writes the role and says a row moved', async () => {
    const account = await signUp(context.app, 'promu@tickettout.test');

    expect(await users.setRole(account.id, ROLES.ADMIN)).toBe(true);
    expect((await users.findById(account.id))?.role).toBe(ROLES.ADMIN);
  });

  it('says no row moved when the id matches nothing', async () => {
    expect(
      await users.setRole('01a062a4-0000-7000-8000-000000000000', ROLES.ADMIN),
    ).toBe(false);
  });
});

describe('the constraints the schema carries', () => {
  it('refuses a second account on the same address', async () => {
    await signUp(context.app, 'unique@tickettout.test');

    await expect(
      context.dataSource.getRepository(User).insert({
        name: 'Doublon',
        email: 'unique@tickettout.test',
        emailVerified: false,
      }),
    ).rejects.toThrow(/duplicate key|unique/i);
  });

  it('closes the sessions of a deleted account', async () => {
    const account = await signUp(context.app, 'supprime@tickettout.test');
    // Sign-up opens a wallet, which has its own foreign key to the account.
    await context.dataSource
      .getRepository(Wallet)
      .delete({ user: { id: account.id } });

    await context.dataSource.getRepository(User).delete({ id: account.id });

    const sessions: Array<{ count: string }> = await context.dataSource.query(
      `SELECT count(*) FROM session WHERE user_id = $1`,
      [account.id],
    );
    expect(sessions[0].count).toBe('0');
  });
});
