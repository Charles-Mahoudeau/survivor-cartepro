import type { PaymentTokenPayload } from '../payment-token.contract';

/** Demo values to replace when signed payment tokens are implemented. */
export const STATIC_PAYMENT_TOKEN: PaymentTokenPayload = {
  token: 'demo-payment-token',
  qrPayload: 'demo-payment-token',
  shortCode: 'CPR4F7X2',
  expiresAt: '2026-09-04T02:02:00.000Z',
};
/** Payload format version. Bump when the claims shape changes; old tokens then fail closed. */
export const CURRENT_PAYMENT_TOKEN_VERSION = 1;

/** Hard ceiling on QR lifetime, independent of the configured PAYMENT_TOKEN_TTL_SECONDS. */
export const MAX_PAYMENT_TOKEN_TTL_SECONDS = 300;

export const SHORT_CODE_LENGTH = 8;

/** Alphanumeric, uppercase — matches what a partner types at the counter. */
export const SHORT_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Bounds the retry loop on a uniqueness collision among live tokens. */
export const SHORT_CODE_MAX_ATTEMPTS = 5;
