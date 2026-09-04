import type { DataSource } from 'typeorm';
import { Payment } from '@/modules/payments/entities/payment.entity';
import { PaymentToken } from '@/modules/payments/entities/payment-token.entity';
import { CaptureMode } from '@/modules/payments/enums/capture-mode.enum';
import { PaymentTokenStatus } from '@/modules/payments/enums/payment-token-status.enum';

let fixtureSequence = 0;

export async function createPayment(
  dataSource: DataSource,
  walletId: string,
  partnerId: string,
  overrides: Partial<Payment> = {},
): Promise<Payment> {
  const paymentToken = await dataSource.getRepository(PaymentToken).save({
    wallet: { id: walletId },
    shortCode: String(++fixtureSequence).padStart(8, '0'),
    status: PaymentTokenStatus.CONSUMED,
    expiresAt: new Date(Date.now() + 60_000),
  });

  return dataSource.getRepository(Payment).save({
    wallet: { id: walletId },
    partner: { id: partnerId },
    amount: 10,
    paymentToken: { id: paymentToken.id },
    captureMode: CaptureMode.QR_CODE,
    ...overrides,
  });
}
