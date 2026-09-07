import { ROLES } from '@/config/auth/auth.constants';
import { WalletStatus } from '@/modules/wallets/enums';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../test/app';
import { createAllocation } from '../../../../test/fixtures/allocation.fixture';
import { createEmployer } from '../../../../test/fixtures/employer.fixture';
import {
  createUser,
  grantRole,
  signUp,
} from '../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../test/http';
import { AllocationExclusionReason } from '../enums/allocation-exclusion-reason.enum';
import { AllocationStatus } from '../enums/allocation-status.enum';

let context: TestApp;
let sequence = 0;

interface AllocationBody {
  id: string;
  employerId: string;
  employerName: string;
  label: string;
  amount: string;
  status: AllocationStatus;
  appliedAt: string | null;
}

interface AllocationDetailBody extends AllocationBody {
  beneficiaries: { walletId: string; employeeRef: string | null }[];
  excluded: { walletId: string; reason: AllocationExclusionReason }[];
  total: string;
}

const listAllocations = (cookie: string[]) =>
  api(context.app).get(apiPath('/allocations')).set('Cookie', cookie);
const getAllocation = (cookie: string[], id: string) =>
  api(context.app)
    .get(apiPath(`/allocations/${id}`))
    .set('Cookie', cookie);

async function signUpAdmin() {
  const account = await signUp(
    context.app,
    `agent-${++sequence}-${Date.now()}@tickettout.test`,
  );
  await grantRole(context, account.id, ROLES.ADMIN);
  return account;
}

/** An employer with `active` spendable wallets and `disabled` suspended ones. */
async function seedEmployer(
  ownerId: string,
  { active, disabled }: { active: number; disabled: number },
) {
  const employer = await createEmployer(context.dataSource, ownerId);

  for (let index = 0; index < active + disabled; index++) {
    const holder = await createUser(
      context,
      `Porteur ${index}`,
      `holder-${++sequence}-${Date.now()}@tickettout.test`,
    );
    await createWallet(context.dataSource, holder.id, {
      employer: { id: employer.id },
      employeeRef: `EMP-${index}`,
      status: index < active ? WalletStatus.ACTIVE : WalletStatus.DISABLED,
    });
  }

  return employer;
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

describe('GET /allocations', () => {
  it('lists the allocations, most recent first', async () => {
    const agent = await signUpAdmin();
    const employer = await createEmployer(context.dataSource, agent.id);
    const first = await createAllocation(
      context.dataSource,
      employer.id,
      agent.id,
      { label: 'Rentrée' },
    );
    const second = await createAllocation(
      context.dataSource,
      employer.id,
      agent.id,
      { label: 'Fin d’année' },
    );

    const response = await listAllocations(agent.cookie).expect(200);
    const page = bodyOf<{ items: AllocationBody[]; hasMore: boolean }>(
      response,
    );

    expect(page.items.map((item) => item.id)).toEqual([second.id, first.id]);
    expect(page.items[0]).toMatchObject({
      label: 'Fin d’année',
      employerId: employer.id,
      employerName: employer.name,
      status: AllocationStatus.DRAFT,
      appliedAt: null,
    });
    expect(page.hasMore).toBe(false);
  });

  it('refuses an employee', async () => {
    const employee = await signUp(context.app, 'salarie@tickettout.test');

    await listAllocations(employee.cookie).expect(403);
  });

  it('refuses a caller with no session', async () => {
    await api(context.app).get(apiPath('/allocations')).expect(401);
  });
});

describe('POST /allocations', () => {
  it('creates a draft nobody has been credited by yet', async () => {
    const agent = await signUpAdmin();
    const employer = await createEmployer(context.dataSource, agent.id);

    const response = await api(context.app)
      .post(apiPath('/allocations'))
      .set('Cookie', agent.cookie)
      .send({ employerId: employer.id, label: 'Rentrée', amount: 90 })
      .expect(201);

    expect(bodyOf<AllocationBody>(response)).toMatchObject({
      employerId: employer.id,
      employerName: employer.name,
      label: 'Rentrée',
      amount: '90.00',
      status: AllocationStatus.DRAFT,
      appliedAt: null,
    });
  });

  it('refuses an employer that does not exist', async () => {
    const agent = await signUpAdmin();

    await api(context.app)
      .post(apiPath('/allocations'))
      .set('Cookie', agent.cookie)
      .send({
        employerId: '01930000-0000-7000-8000-000000000000',
        label: 'Rentrée',
        amount: 90,
      })
      .expect(404);
  });

  it('refuses an amount with more than two decimals, or none at all', async () => {
    const agent = await signUpAdmin();
    const employer = await createEmployer(context.dataSource, agent.id);
    const post = (amount: unknown) =>
      api(context.app)
        .post(apiPath('/allocations'))
        .set('Cookie', agent.cookie)
        .send({ employerId: employer.id, label: 'Rentrée', amount });

    await post(90.001).expect(400);
    await post(0).expect(400);
    await post(-10).expect(400);
  });
});

describe('GET /allocations/:id', () => {
  it('splits the wallets of the employer into beneficiaries and excluded', async () => {
    const agent = await signUpAdmin();
    const employer = await seedEmployer(agent.id, { active: 3, disabled: 2 });
    const allocation = await createAllocation(
      context.dataSource,
      employer.id,
      agent.id,
      { amount: 90 },
    );

    const response = await getAllocation(agent.cookie, allocation.id).expect(
      200,
    );
    const detail = bodyOf<AllocationDetailBody>(response);

    expect(detail.beneficiaries).toHaveLength(3);
    expect(detail.excluded).toHaveLength(2);
    expect(detail.excluded.map((row) => row.reason)).toEqual([
      AllocationExclusionReason.WALLET_DISABLED,
      AllocationExclusionReason.WALLET_DISABLED,
    ]);
    expect(detail.total).toBe('270.00');
  });

  it('credits nobody, and totals nothing, when every wallet is suspended', async () => {
    const agent = await signUpAdmin();
    const employer = await seedEmployer(agent.id, { active: 0, disabled: 2 });
    const allocation = await createAllocation(
      context.dataSource,
      employer.id,
      agent.id,
      { amount: 90 },
    );

    const response = await getAllocation(agent.cookie, allocation.id).expect(
      200,
    );
    const detail = bodyOf<AllocationDetailBody>(response);

    expect(detail.beneficiaries).toEqual([]);
    expect(detail.excluded).toHaveLength(2);
    expect(detail.total).toBe('0.00');
  });

  it('answers 404 on an allocation that does not exist', async () => {
    const agent = await signUpAdmin();

    await getAllocation(
      agent.cookie,
      '01930000-0000-7000-8000-000000000000',
    ).expect(404);
  });
});

describe('PATCH /allocations/:id', () => {
  it('amends a draft and answers with the refreshed total', async () => {
    const agent = await signUpAdmin();
    const employer = await seedEmployer(agent.id, { active: 3, disabled: 0 });
    const allocation = await createAllocation(
      context.dataSource,
      employer.id,
      agent.id,
      { amount: 90 },
    );

    const response = await api(context.app)
      .patch(apiPath(`/allocations/${allocation.id}`))
      .set('Cookie', agent.cookie)
      .send({ label: 'Prime de rentrée', amount: 120 })
      .expect(200);
    const detail = bodyOf<AllocationDetailBody>(response);

    expect(detail).toMatchObject({
      label: 'Prime de rentrée',
      amount: '120.00',
      total: '360.00',
    });
  });

  it('answers 409 on an applied allocation, and changes nothing', async () => {
    const agent = await signUpAdmin();
    const employer = await createEmployer(context.dataSource, agent.id);
    const allocation = await createAllocation(
      context.dataSource,
      employer.id,
      agent.id,
      {
        label: 'Rentrée',
        status: AllocationStatus.APPLIED,
        appliedAt: new Date(),
      },
    );

    await api(context.app)
      .patch(apiPath(`/allocations/${allocation.id}`))
      .set('Cookie', agent.cookie)
      .send({ label: 'Réécrite' })
      .expect(409);

    const response = await getAllocation(agent.cookie, allocation.id).expect(
      200,
    );
    expect(bodyOf<AllocationBody>(response).label).toBe('Rentrée');
  });
});
