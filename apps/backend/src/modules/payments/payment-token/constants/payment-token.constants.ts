import type { PaymentTokenPayload } from '../payment-token.contract';

/** Demo values to replace when signed payment tokens are implemented. */
export const STATIC_PAYMENT_TOKEN: PaymentTokenPayload = {
  token: 'demo-payment-token',
  qrPayload: 'demo-payment-token',
  shortCode: 'CPR4F7X2',
  expiresAt: '2026-09-04T02:02:00.000Z',
};
