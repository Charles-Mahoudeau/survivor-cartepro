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
