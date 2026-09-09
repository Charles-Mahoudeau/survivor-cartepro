import type { DataSource, DeepPartial } from 'typeorm';
import { PaymentToken } from '@/modules/payments/core/entities/payment-token.entity';
import { Payment } from '@/modules/payments/core/entities/payment.entity';
import { CaptureMode } from '@/modules/payments/core/enums/capture-mode.enum';
import { PaymentTokenStatus } from '@/modules/payments/core/enums/payment-token-status.enum';

let fixtureSequence = 0;

/** Eight digits, which the short-code alphabet allows, unique within a spec run. */
function nextShortCode(): string {
  return String(++fixtureSequence).padStart(8, '0');
}

export function createPaymentToken(
  dataSource: DataSource,
  walletId: string,
  overrides: DeepPartial<PaymentToken> = {},
): Promise<PaymentToken> {
  return dataSource.getRepository(PaymentToken).save({
    wallet: { id: walletId },
    shortCode: nextShortCode(),
    status: PaymentTokenStatus.LIVE,
    expiresAt: new Date(Date.now() + 60_000),
    ...overrides,
  });
}

export async function createPayment(
  dataSource: DataSource,
  walletId: string,
  partnerId: string,
  overrides: Partial<Payment> = {},
): Promise<Payment> {
  const paymentToken = await createPaymentToken(dataSource, walletId, {
    status: PaymentTokenStatus.CONSUMED,
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
