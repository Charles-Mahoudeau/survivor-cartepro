import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { grantRole, signUp } from '../../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import { ROLES } from '@/config/auth/auth.constants';
import { Audit } from '@/modules/audit/entities';
import { AuditAction } from '@/modules/audit/enums';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';

let context: TestApp;

const UNKNOWN_EMPLOYEE_ID = '0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';

const getEmployeeBalance = (cookie: string[], employeeId: string) =>
  api(context.app)
    .get(apiPath(`/employees/${employeeId}/balance`))
    .set('Cookie', cookie);

const signUpAdmin = async (email: string) => {
  const admin = await signUp(context.app, email);
  await grantRole(context, admin.id, ROLES.ADMIN);
  return admin;
};

const dropWalletOf = (userId: string) =>
  context.dataSource.getRepository(Wallet).delete({ user: { id: userId } });

const findAdminActionOn = async (targetId: string) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const entry = await context.dataSource
      .getRepository(Audit)
      .findOne({ where: { targetId, action: AuditAction.ADMIN_ACTION } });
    if (entry) return entry;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return null;
};

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

describe('GET /employees/:id/balance', () => {
  it('serves the balance and the currency of the targeted account', async () => {
    const admin = await signUpAdmin('balance-admin@cartepro.test');
    const employee = await signUp(context.app, 'balance-target@cartepro.test');
    await createWallet(context.dataSource, employee.id, { balance: 137.5 });

    const response = await getEmployeeBalance(admin.cookie, employee.id).expect(
      200,
    );

    expect(bodyOf<{ balance: string; currency: string }>(response)).toEqual({
      balance: '137.50',
      currency: 'EUR',
    });
  });

  it('serves a zero balance rather than omitting the account', async () => {
    const admin = await signUpAdmin('balance-admin-zero@cartepro.test');
    const employee = await signUp(context.app, 'balance-zero@cartepro.test');
    await createWallet(context.dataSource, employee.id, { balance: 0 });

    const response = await getEmployeeBalance(admin.cookie, employee.id).expect(
      200,
    );

    expect(bodyOf<{ balance: string }>(response).balance).toBe('0.00');
  });

  it('answers 404 when the account holds no wallet', async () => {
    const admin = await signUpAdmin('balance-admin-404@cartepro.test');
    const employee = await signUp(
      context.app,
      'balance-walletless@cartepro.test',
    );
    await dropWalletOf(employee.id);

    const response = await getEmployeeBalance(admin.cookie, employee.id).expect(
      404,
    );

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'WALLET_NOT_FOUND',
    );
  });

  it('answers an unknown identifier exactly like an account with no wallet', async () => {
    const admin = await signUpAdmin('balance-admin-unknown@cartepro.test');
    const employee = await signUp(context.app, 'balance-known@cartepro.test');
    await dropWalletOf(employee.id);

    const known = await getEmployeeBalance(admin.cookie, employee.id).expect(
      404,
    );
    const unknown = await getEmployeeBalance(
      admin.cookie,
      UNKNOWN_EMPLOYEE_ID,
    ).expect(404);

    expect(bodyOf(unknown)).toEqual(bodyOf(known));
  });

  it('refuses an identifier that is not a UUID version 7', async () => {
    const admin = await signUpAdmin('balance-admin-400@cartepro.test');

    await getEmployeeBalance(admin.cookie, 'not-a-uuid').expect(400);
  });

  it('refuses an employee reading another account', async () => {
    const employee = await signUp(context.app, 'balance-caller@cartepro.test');
    const target = await signUp(
      context.app,
      'balance-target-403@cartepro.test',
    );
    await createWallet(context.dataSource, target.id, { balance: 10 });

    const response = await getEmployeeBalance(
      employee.cookie,
      target.id,
    ).expect(403);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('refuses a request with no session', async () => {
    const target = await signUp(
      context.app,
      'balance-target-401@cartepro.test',
    );

    await api(context.app)
      .get(apiPath(`/employees/${target.id}/balance`))
      .expect(401);
  });

  it('records the read in the audit log', async () => {
    const admin = await signUpAdmin('balance-admin-audit@cartepro.test');
    const employee = await signUp(context.app, 'balance-audited@cartepro.test');
    await createWallet(context.dataSource, employee.id, { balance: 20 });

    await getEmployeeBalance(admin.cookie, employee.id).expect(200);

    const entry = await findAdminActionOn(employee.id);

    expect(entry).not.toBeNull();
    expect(entry?.targetType).toBe('wallet');
    expect(entry?.actorId).toBe(admin.id);
    expect(entry?.actorRole).toBe(ROLES.ADMIN);
  });

  it('leaves no admin action behind when the read is refused', async () => {
    const employee = await signUp(
      context.app,
      'balance-unaudited@cartepro.test',
    );
    const target = await signUp(context.app, 'balance-untouched@cartepro.test');
    await createWallet(context.dataSource, target.id, { balance: 30 });

    await getEmployeeBalance(employee.cookie, target.id).expect(403);

    expect(await findAdminActionOn(target.id)).toBeNull();
  });
});
