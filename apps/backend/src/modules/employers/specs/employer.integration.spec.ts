import { ROLES } from '@/config/auth/auth.constants';
import { WalletStatus } from '@/modules/wallets/enums';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import { createEmployer } from '../../../../test/fixtures/employer.fixture';
import {
  createUser,
  grantRole,
  signUp,
} from '../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../test/http';

let context: TestApp;
let sequence = 0;

interface EmployerBody {
  id: string;
  name: string;
  siren: string;
  activeWalletCount: number;
}

const listEmployers = (cookie: string[]) =>
  api(context.app).get(apiPath('/employers')).set('Cookie', cookie);
const createEmployerRequest = (cookie: string[], body: object) =>
  api(context.app).post(apiPath('/employers')).set('Cookie', cookie).send(body);

async function signUpAdmin() {
  const account = await signUp(
    context.app,
    `agent-${++sequence}-${Date.now()}@tickettout.test`,
  );
  await grantRole(context, account.id, ROLES.ADMIN);
  return account;
}

async function seedWallets(
  employerId: string,
  { active, disabled }: { active: number; disabled: number },
) {
  for (let index = 0; index < active + disabled; index++) {
    const holder = await createUser(
      context,
      `Porteur ${index}`,
      `holder-${++sequence}-${Date.now()}@tickettout.test`,
    );
    await createWallet(context.dataSource, holder.id, {
      employer: { id: employerId },
      employeeRef: `EMP-${++sequence}`,
      status: index < active ? WalletStatus.ACTIVE : WalletStatus.DISABLED,
    });
  }
}

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('GET /employers', () => {
  it('counts the spendable wallets of each employer, and only those', async () => {
    const agent = await signUpAdmin();
    const withWallets = await createEmployer(context.dataSource, {
      name: 'Mairie de Lyon',
    });
    await seedWallets(withWallets.id, { active: 3, disabled: 2 });
    const withoutWallets = await createEmployer(context.dataSource, {
      name: 'Préfecture',
    });

    const response = await listEmployers(agent.cookie).expect(200);
    const page = bodyOf<{ items: EmployerBody[] }>(response);
    const counts = new Map(
      page.items.map((item) => [item.id, item.activeWalletCount]),
    );

    expect(counts.get(withWallets.id)).toBe(3);
    expect(counts.get(withoutWallets.id)).toBe(0);
    expect(page.items[0]).toMatchObject({
      id: withoutWallets.id,
      name: 'Préfecture',
    });
  });

  it('does not count a wallet of another employer', async () => {
    const agent = await signUpAdmin();
    const target = await createEmployer(context.dataSource);
    const neighbour = await createEmployer(context.dataSource);
    await seedWallets(target.id, { active: 2, disabled: 0 });
    await seedWallets(neighbour.id, { active: 5, disabled: 0 });

    const response = await listEmployers(agent.cookie).expect(200);
    const counts = new Map(
      bodyOf<{ items: EmployerBody[] }>(response).items.map((item) => [
        item.id,
        item.activeWalletCount,
      ]),
    );

    expect(counts.get(target.id)).toBe(2);
    expect(counts.get(neighbour.id)).toBe(5);
  });

  it('refuses an employee', async () => {
    const employee = await signUp(context.app, 'salarie@tickettout.test');

    await listEmployers(employee.cookie).expect(403);
  });

  it('refuses a caller with no session', async () => {
    await api(context.app).get(apiPath('/employers')).expect(401);
  });
});

describe('POST /employers', () => {
  it('registers an employer the administration can target', async () => {
    const agent = await signUpAdmin();

    const response = await createEmployerRequest(agent.cookie, {
      name: 'Mairie de Lyon',
      siren: '552100554',
    }).expect(201);

    expect(bodyOf<EmployerBody>(response)).toMatchObject({
      name: 'Mairie de Lyon',
      siren: '552100554',
      activeWalletCount: 0,
    });
  });

  it('refuses a SIREN another employer already registers', async () => {
    const agent = await signUpAdmin();
    await createEmployer(context.dataSource, { siren: '552100554' });

    const response = await createEmployerRequest(agent.cookie, {
      name: 'Doublon',
      siren: '552100554',
    }).expect(409);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'EMPLOYER_SIREN_ALREADY_USED',
    );
  });

  it('refuses a SIREN that is not nine digits', async () => {
    const agent = await signUpAdmin();
    const post = (siren: unknown) =>
      createEmployerRequest(agent.cookie, { name: 'Mairie', siren });

    await post('55210055').expect(400);
    await post('5521005541').expect(400);
    await post('55210055A').expect(400);
  });

  it('refuses a name made of nothing but spaces', async () => {
    const agent = await signUpAdmin();

    await createEmployerRequest(agent.cookie, {
      name: '   ',
      siren: '552100554',
    }).expect(400);
  });

  it('answers 409 to the loser of two simultaneous creations, never 500', async () => {
    const agent = await signUpAdmin();

    const answers = await Promise.all(
      ['Mairie de Lyon', 'Mairie de Lyon bis'].map((name) =>
        createEmployerRequest(agent.cookie, {
          name,
          siren: '552100554',
        }).then((response) => response.status),
      ),
    );

    expect(answers.filter((status) => status === 201)).toHaveLength(1);
    expect(answers.filter((status) => status === 409)).toHaveLength(1);
  });

  it('refuses an employee', async () => {
    const employee = await signUp(context.app, 'salarie@tickettout.test');

    await createEmployerRequest(employee.cookie, {
      name: 'Mairie',
      siren: '552100554',
    }).expect(403);
  });
});
