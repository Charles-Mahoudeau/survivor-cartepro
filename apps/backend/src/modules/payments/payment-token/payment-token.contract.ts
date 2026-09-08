export interface PaymentTokenPayload {
  token: string;
  qrPayload: string;
  shortCode: string;
  expiresAt: string;
}

export interface PaymentTokenSource {
  issue(userId: string): Promise<PaymentTokenPayload>;
  getCurrent(userId: string): Promise<PaymentTokenPayload>;
  revokeCurrent(userId: string): Promise<void>;
}

export const PAYMENT_TOKEN_SOURCE = Symbol('PAYMENT_TOKEN_SOURCE');

export interface PaymentTokenClaims {
  userId: string;
  walletId: string;
  expiresAt: string;
  version: number;
}

/** How a partner hands back a token at collection: the scanned QR, or the short code they typed. */
export type PaymentTokenLookup = { qrPayload: string } | { shortCode: string };

/** What a lookup resolves to, before the token is locked for collection. */
export interface ResolvedPaymentToken {
  tokenId: string;
  walletId: string;
}

/** The result of re-verifying and consuming a token under lock. */
export type PaymentTokenCollectOutcome =
  { status: 'already-consumed' } | { status: 'consumed'; walletId: string };
