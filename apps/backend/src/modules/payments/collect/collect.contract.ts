import type { CaptureMode } from '@/modules/payments/core/enums';
import type { PaymentTokenLookup } from '@/modules/payments/payment-token/payment-token.contract';

/** What a partner's collection request asks for, whatever form the token arrives in. */
export interface CollectInput {
  lookup: PaymentTokenLookup;
  partnerId: string;
  amount: number;
  captureMode: CaptureMode;
  partnerReference: string | null;
}

/** What collecting a payment answers — the partner's side, never the wallet's balance. */
export interface CollectResult {
  paymentId: string;
  amount: string;
  partnerReference: string | null;
  createdAt: Date;
}
