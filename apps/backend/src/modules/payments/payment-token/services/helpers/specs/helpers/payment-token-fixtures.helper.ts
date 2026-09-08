import { createHmac } from 'node:crypto';
import { CURRENT_PAYMENT_TOKEN_VERSION } from '../../../../constants/payment-token.constants';
import type { PaymentTokenClaims } from '../../../../payment-token.contract';

export function buildClaims(
  overrides: Partial<PaymentTokenClaims> = {},
): PaymentTokenClaims {
  return {
    userId: 'user-1',
    walletId: 'wallet-1',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    version: CURRENT_PAYMENT_TOKEN_VERSION,
    ...overrides,
  };
}

export function flipLastChar(value: string): string {
  // A base64url string's final character can carry padding bits that don't
  // affect the decoded bytes, so swapping adjacent characters (e.g. A -> B)
  // can silently decode to the same byte. E and A sit 4 apart, guaranteeing
  // a different 4-bit group regardless of the original character.
  const last = value.at(-1);
  return value.slice(0, -1) + (last === 'A' ? 'E' : 'A');
}

/** Signs an arbitrary body with the real HMAC math, bypassing `signPaymentToken`'s JSON encoding. */
export function forgeToken(body: string, secret: string): string {
  const signature = createHmac('sha256', secret)
    .update(body)
    .digest('base64url');
  return `${body}.${signature}`;
}
