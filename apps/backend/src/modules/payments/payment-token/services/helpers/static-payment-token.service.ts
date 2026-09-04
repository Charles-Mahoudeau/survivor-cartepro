import { Injectable } from '@nestjs/common';
import { STATIC_PAYMENT_TOKEN } from '../../constants/payment-token.constants';
import type {
  PaymentTokenPayload,
  PaymentTokenSource,
} from '../../payment-token.contract';

@Injectable()
export class StaticPaymentTokenService implements PaymentTokenSource {
  issue(userId: string): PaymentTokenPayload {
    // FIXME: Replace the static payload with real token generation and signing.
    void userId;
    return { ...STATIC_PAYMENT_TOKEN };
  }

  getCurrent(userId: string): PaymentTokenPayload {
    void userId;
    return { ...STATIC_PAYMENT_TOKEN };
  }
}
