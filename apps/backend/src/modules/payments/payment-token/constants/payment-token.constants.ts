import type { PaymentTokenPayload } from '../payment-token.contract';

/** Demo values to replace when signed payment tokens are implemented. */
export const STATIC_PAYMENT_TOKEN: PaymentTokenPayload = {
  token: 'demo-payment-token',
  qrPayload: 'demo-payment-token',
  shortCode: 'CPR4F7X2',
  expiresAt: '2026-09-04T02:02:00.000Z',
};

export const SHORT_CODE_LENGTH = 8;

/** Alphanumeric, uppercase — matches what a partner types at the counter. */
export const SHORT_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Bounds the retry loop on a uniqueness collision among live tokens. */
export const SHORT_CODE_MAX_ATTEMPTS = 5;
