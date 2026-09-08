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
  ownerId: string;
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
    const withWallets = await createEmployer(context.dataSource, agent.id, {
      name: 'Mairie de Lyon',
    });
    await seedWallets(withWallets.id, { active: 3, disabled: 2 });

    const otherOwner = await createUser(
      context,
      'Autre patron',
      `owner-${++sequence}-${Date.now()}@tickettout.test`,
    );
    const withoutWallets = await createEmployer(
      context.dataSource,
      otherOwner.id,
      { name: 'Préfecture' },
    );

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
      ownerId: otherOwner.id,
    });
  });

  it('does not count a wallet of another employer', async () => {
    const agent = await signUpAdmin();
    const target = await createEmployer(context.dataSource, agent.id);
    const neighbourOwner = await createUser(
      context,
      'Voisin',
      `owner-${++sequence}-${Date.now()}@tickettout.test`,
    );
    const neighbour = await createEmployer(
      context.dataSource,
      neighbourOwner.id,
    );
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
  it('registers an employer under an existing account', async () => {
    const agent = await signUpAdmin();
    const owner = await createUser(
      context,
      'Patron',
      `owner-${++sequence}-${Date.now()}@tickettout.test`,
    );

    const response = await createEmployerRequest(agent.cookie, {
      ownerId: owner.id,
      name: 'Mairie de Lyon',
      siren: '552100554',
    }).expect(201);

    expect(bodyOf<EmployerBody>(response)).toMatchObject({
      name: 'Mairie de Lyon',
      siren: '552100554',
      ownerId: owner.id,
      activeWalletCount: 0,
    });
  });

  it('refuses a SIREN another employer already registers', async () => {
    const agent = await signUpAdmin();
    await createEmployer(context.dataSource, agent.id, { siren: '552100554' });
    const owner = await createUser(
      context,
      'Patron',
      `owner-${++sequence}-${Date.now()}@tickettout.test`,
    );

    const response = await createEmployerRequest(agent.cookie, {
      ownerId: owner.id,
      name: 'Doublon',
      siren: '552100554',
    }).expect(409);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'EMPLOYER_SIREN_ALREADY_USED',
    );
  });

  it('refuses an account that already owns an employer', async () => {
    const agent = await signUpAdmin();
    const owner = await createUser(
      context,
      'Patron',
      `owner-${++sequence}-${Date.now()}@tickettout.test`,
    );
    await createEmployer(context.dataSource, owner.id);

    const response = await createEmployerRequest(agent.cookie, {
      ownerId: owner.id,
      name: 'Deuxième employeur',
      siren: '552100554',
    }).expect(409);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'EMPLOYER_OWNER_ALREADY_ASSIGNED',
    );
  });

  it('refuses an owner that does not exist', async () => {
    const agent = await signUpAdmin();

    await createEmployerRequest(agent.cookie, {
      ownerId: '01930000-0000-7000-8000-000000000000',
      name: 'Fantôme',
      siren: '552100554',
    }).expect(404);
  });

  it('refuses a SIREN that is not nine digits', async () => {
    const agent = await signUpAdmin();
    const owner = await createUser(
      context,
      'Patron',
      `owner-${++sequence}-${Date.now()}@tickettout.test`,
    );
    const post = (siren: unknown) =>
      createEmployerRequest(agent.cookie, {
        ownerId: owner.id,
        name: 'Mairie',
        siren,
      });

    await post('55210055').expect(400);
    await post('5521005541').expect(400);
    await post('55210055A').expect(400);
  });

  it('refuses a name made of nothing but spaces', async () => {
    const agent = await signUpAdmin();
    const owner = await createUser(
      context,
      'Patron',
      `owner-${++sequence}-${Date.now()}@tickettout.test`,
    );

    await createEmployerRequest(agent.cookie, {
      ownerId: owner.id,
      name: '   ',
      siren: '552100554',
    }).expect(400);
  });

  it('answers 409 to the loser of two simultaneous creations, never 500', async () => {
    const agent = await signUpAdmin();
    const owners = await Promise.all([
      createUser(context, 'A', `a-${++sequence}-${Date.now()}@tickettout.test`),
      createUser(context, 'B', `b-${++sequence}-${Date.now()}@tickettout.test`),
    ]);

    const answers = await Promise.all(
      owners.map((owner) =>
        createEmployerRequest(agent.cookie, {
          ownerId: owner.id,
          name: 'Mairie de Lyon',
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
      ownerId: employee.id,
      name: 'Mairie',
      siren: '552100554',
    }).expect(403);
  });
});
