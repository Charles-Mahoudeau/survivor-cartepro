import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  CURRENT_PAYMENT_TOKEN_VERSION,
  MAX_PAYMENT_TOKEN_TTL_SECONDS,
} from '../../constants/payment-token.constants';
import type { PaymentTokenClaims } from '../../payment-token.contract';
import {
  PaymentTokenExpiredError,
  PaymentTokenSignatureInvalidError,
  PaymentTokenUnsupportedVersionError,
} from './payment-token-signer.errors';

const TOKEN_PART_SEPARATOR = '.';

/** Never exceeds the hard ceiling, whatever the caller (or a misconfigured env) requests. */
export function capPaymentTokenTtlSeconds(requestedTtlSeconds: number): number {
  return Math.min(requestedTtlSeconds, MAX_PAYMENT_TOKEN_TTL_SECONDS);
}

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

export function signPaymentToken(
  claims: PaymentTokenClaims,
  secret: string,
): string {
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${body}${TOKEN_PART_SEPARATOR}${sign(body, secret)}`;
}

export function verifyPaymentToken(
  qrPayload: string,
  secret: string,
): PaymentTokenClaims {
  const parts = qrPayload.split(TOKEN_PART_SEPARATOR);
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new PaymentTokenSignatureInvalidError();
  }
  const [body, signature] = parts;

  const provided = Buffer.from(signature, 'base64url');
  const expected = Buffer.from(sign(body, secret), 'base64url');
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    throw new PaymentTokenSignatureInvalidError();
  }

  let claims: PaymentTokenClaims;
  try {
    claims = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf-8'),
    ) as PaymentTokenClaims;
  } catch {
    throw new PaymentTokenSignatureInvalidError();
  }

  if (claims.version !== CURRENT_PAYMENT_TOKEN_VERSION) {
    throw new PaymentTokenUnsupportedVersionError(claims.version);
  }

  if (Date.now() > new Date(claims.expiresAt).getTime()) {
    throw new PaymentTokenExpiredError();
  }

  return claims;
}
