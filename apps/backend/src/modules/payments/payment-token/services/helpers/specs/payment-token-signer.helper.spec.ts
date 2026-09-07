import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'bun:test';
import {
  CURRENT_PAYMENT_TOKEN_VERSION,
  MAX_PAYMENT_TOKEN_TTL_SECONDS,
} from '../../../constants/payment-token.constants';
import type { PaymentTokenClaims } from '../../../payment-token.contract';
import {
  capPaymentTokenTtlSeconds,
  PaymentTokenExpiredError,
  PaymentTokenSignatureInvalidError,
  PaymentTokenUnsupportedVersionError,
  signPaymentToken,
  verifyPaymentToken,
} from '../payment-token-signer.helper';

const SECRET = 'a'.repeat(32);
const OTHER_SECRET = 'b'.repeat(32);

function buildClaims(
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

function flipLastChar(value: string): string {
  const last = value.at(-1);
  return value.slice(0, -1) + (last === 'A' ? 'B' : 'A');
}

function forgeToken(body: string, secret: string): string {
  const signature = createHmac('sha256', secret)
    .update(body)
    .digest('base64url');
  return `${body}.${signature}`;
}

describe('signPaymentToken / verifyPaymentToken', () => {
  describe('round trip', () => {
    it('verifies a token it just signed and returns the exact claims', () => {
      const claims = buildClaims();

      expect(
        verifyPaymentToken(signPaymentToken(claims, SECRET), SECRET),
      ).toEqual(claims);
    });

    it('produces a token made of a body and a signature separated by a dot', () => {
      const token = signPaymentToken(buildClaims(), SECRET);

      expect(token.split('.')).toHaveLength(2);
    });
  });

  describe('tampering', () => {
    it('rejects a token whose body was altered by one character', () => {
      const [body, signature] = signPaymentToken(buildClaims(), SECRET).split(
        '.',
      );

      expect(() =>
        verifyPaymentToken(`${flipLastChar(body)}.${signature}`, SECRET),
      ).toThrow(PaymentTokenSignatureInvalidError);
    });

    it('rejects a token whose signature was altered by one character', () => {
      const token = signPaymentToken(buildClaims(), SECRET);

      expect(() => verifyPaymentToken(flipLastChar(token), SECRET)).toThrow(
        PaymentTokenSignatureInvalidError,
      );
    });

    it('rejects a token signed with a different secret', () => {
      const token = signPaymentToken(buildClaims(), OTHER_SECRET);

      expect(() => verifyPaymentToken(token, SECRET)).toThrow(
        PaymentTokenSignatureInvalidError,
      );
    });

    it('rejects a truncated signature without crashing', () => {
      const token = signPaymentToken(buildClaims(), SECRET);
      const [body, signature] = token.split('.');

      expect(() =>
        verifyPaymentToken(`${body}.${signature.slice(0, -4)}`, SECRET),
      ).toThrow(PaymentTokenSignatureInvalidError);
    });

    it('rejects a body that is correctly signed but not valid JSON', () => {
      const body = Buffer.from('not-json').toString('base64url');

      expect(() =>
        verifyPaymentToken(forgeToken(body, SECRET), SECRET),
      ).toThrow(PaymentTokenSignatureInvalidError);
    });
  });

  describe('malformed input', () => {
    it('rejects an empty string', () => {
      expect(() => verifyPaymentToken('', SECRET)).toThrow(
        PaymentTokenSignatureInvalidError,
      );
    });

    it('rejects a payload with no separator', () => {
      expect(() => verifyPaymentToken('not-a-token', SECRET)).toThrow(
        PaymentTokenSignatureInvalidError,
      );
    });

    it('rejects a payload with a body but an empty signature', () => {
      const [body] = signPaymentToken(buildClaims(), SECRET).split('.');

      expect(() => verifyPaymentToken(`${body}.`, SECRET)).toThrow(
        PaymentTokenSignatureInvalidError,
      );
    });

    it('rejects a payload with extra separators', () => {
      const token = signPaymentToken(buildClaims(), SECRET);

      expect(() => verifyPaymentToken(`${token}.extra`, SECRET)).toThrow(
        PaymentTokenSignatureInvalidError,
      );
    });
  });

  describe('version', () => {
    it('accepts the current version', () => {
      const claims = buildClaims({ version: CURRENT_PAYMENT_TOKEN_VERSION });

      expect(() =>
        verifyPaymentToken(signPaymentToken(claims, SECRET), SECRET),
      ).not.toThrow();
    });

    it('rejects an unknown version', () => {
      const claims = buildClaims({
        version: CURRENT_PAYMENT_TOKEN_VERSION + 1,
      });
      const token = signPaymentToken(claims, SECRET);

      expect(() => verifyPaymentToken(token, SECRET)).toThrow(
        PaymentTokenUnsupportedVersionError,
      );
    });
  });

  describe('expiry', () => {
    it('accepts a token that expires one second from now', () => {
      const claims = buildClaims({
        expiresAt: new Date(Date.now() + 1_000).toISOString(),
      });

      expect(() =>
        verifyPaymentToken(signPaymentToken(claims, SECRET), SECRET),
      ).not.toThrow();
    });

    it('rejects a token that expired one second ago', () => {
      const claims = buildClaims({
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
      });
      const token = signPaymentToken(claims, SECRET);

      expect(() => verifyPaymentToken(token, SECRET)).toThrow(
        PaymentTokenExpiredError,
      );
    });
  });

  describe('TTL cap', () => {
    it('caps a requested TTL of 30 minutes down to the 5-minute ceiling', () => {
      expect(capPaymentTokenTtlSeconds(30 * 60)).toBe(
        MAX_PAYMENT_TOKEN_TTL_SECONDS,
      );
    });

    it('leaves a TTL under the ceiling untouched', () => {
      expect(capPaymentTokenTtlSeconds(120)).toBe(120);
    });

    it('leaves a TTL exactly at the ceiling untouched', () => {
      expect(capPaymentTokenTtlSeconds(MAX_PAYMENT_TOKEN_TTL_SECONDS)).toBe(
        MAX_PAYMENT_TOKEN_TTL_SECONDS,
      );
    });
  });
});
