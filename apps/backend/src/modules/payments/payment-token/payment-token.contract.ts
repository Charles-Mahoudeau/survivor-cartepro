export interface PaymentTokenPayload {
  token: string;
  qrPayload: string;
  shortCode: string;
  expiresAt: string;
}

export interface PaymentTokenSource {
  issue(userId: string): PaymentTokenPayload;
  getCurrent(userId: string): PaymentTokenPayload;
}

export const PAYMENT_TOKEN_SOURCE = Symbol('PAYMENT_TOKEN_SOURCE');
