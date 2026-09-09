import { Payment } from '@/modules/payments/core/entities/payment.entity';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from './app';
import { createPayment } from './fixtures/payment.fixture';
import { signUp } from './fixtures/user.fixture';
import { createWallet } from './fixtures/wallet.fixture';
import { PartnerFixture } from '@/modules/partners/core/specs/partner.fixture';

let context: TestApp;

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

describe('payment token uniqueness', () => {
  it('rejects a second payment on an already-consumed payment token', async () => {
    const account = await signUp(
      context.app,
      `payment-uniqueness-${Date.now()}@tickettout.test`,
    );
    const wallet = await createWallet(context.dataSource, account.id);
    const partner = await PartnerFixture.create(context.dataSource, account.id);

    const firstPayment = await createPayment(
      context.dataSource,
      wallet.id,
      partner.id,
    );

    await expect(
      createPayment(context.dataSource, wallet.id, partner.id, {
        paymentToken: firstPayment.paymentToken,
      }),
    ).rejects.toThrow();

    await expect(
      context.dataSource
        .getRepository(Payment)
        .countBy({ paymentToken: { id: firstPayment.paymentToken.id } }),
    ).resolves.toBe(1);
  });
});
