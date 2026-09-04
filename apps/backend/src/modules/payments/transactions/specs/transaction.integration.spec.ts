import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { createPayment } from '../../../../../test/fixtures/payment.fixture';
import { grantRole, signUp } from '../../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import { ROLES } from '../../../../config/auth/auth.constants';
import { PartnerFixture } from '../../../partners/core/specs/partner.fixture';
import { PaymentStatus } from '../../core/enums/payment-status.enum';

let context: TestApp;
const exportTransactions = (cookie: string[]) =>
  api(context.app)
    .get(apiPath('/admin/transactions.csv'))
    .set('Cookie', cookie);

const HEADER = 'id;date_iso8601;employee_id;partner_id;amount_cents;status';

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

async function signUpAdmin() {
  const admin = await signUp(context.app, 'agent@tickettout.test');
  await grantRole(context, admin.id, ROLES.ADMIN);
  return admin;
}

describe('GET /admin/transactions.csv', () => {
  it('serves every payment, refusals included, oldest first, as a semicolon CSV', async () => {
    const admin = await signUpAdmin();
    const employee = await signUp(context.app, 'salarie@tickettout.test');
    const wallet = await createWallet(context.dataSource, employee.id);
    const owner = await signUp(context.app, 'partenaire@tickettout.test');
    const partner = await PartnerFixture.create(context.dataSource, owner.id);
    const validated = await createPayment(
      context.dataSource,
      wallet.id,
      partner.id,
      { amount: 12.5 },
    );
    const refused = await createPayment(
      context.dataSource,
      wallet.id,
      partner.id,
      { amount: 300, status: PaymentStatus.REFUSED },
    );

    const response = await exportTransactions(admin.cookie).expect(200);

    expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="transactions.csv"',
    );
    expect(response.text).toBe(
      `${HEADER}\n` +
        `${validated.id};${validated.createdAt.toISOString()};${employee.id};${partner.id};1250;validated\n` +
        `${refused.id};${refused.createdAt.toISOString()};${employee.id};${partner.id};30000;refused\n`,
    );
  });

  it('serves the header alone when nothing has been paid yet', async () => {
    const admin = await signUpAdmin();

    const response = await exportTransactions(admin.cookie).expect(200);

    expect(response.text).toBe(`${HEADER}\n`);
  });

  it('refuses an employee', async () => {
    const employee = await signUp(context.app, 'salarie@tickettout.test');

    const response = await exportTransactions(employee.cookie).expect(403);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('refuses a partner', async () => {
    const owner = await signUp(context.app, 'partenaire@tickettout.test');
    await grantRole(context, owner.id, ROLES.PARTNER);

    const response = await exportTransactions(owner.cookie).expect(403);

    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('refuses a request with no session', async () => {
    await api(context.app).get(apiPath('/admin/transactions.csv')).expect(401);
  });
});
