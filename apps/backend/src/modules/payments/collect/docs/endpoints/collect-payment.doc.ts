import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UnauthenticatedDoc } from '@/common/docs';
import {
  InsufficientBalanceDoc,
  PaymentForbiddenDoc,
  PaymentReceiptResponseDoc,
  PaymentRequestErrorsDoc,
  PaymentTokenExpiredDoc,
  PaymentTokenSpentDoc,
  PaymentWalletNotFoundDoc,
} from '../commons';

export const CollectPaymentDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Collect a payment',
      description:
        'Settles a payment for the partner the session owns, from the token ' +
        'the employee presented: send either the scanned qrPayload or the ' +
        'typed shortCode, never both. The wallet is debited, the movement is ' +
        'written and the token is spent in one transaction — all of it lands ' +
        'or none does, and the token pays exactly once. Two tills racing the ' +
        'same token debit it once: the one that arrives second gets its own ' +
        'payment back if the request was identical, and is refused otherwise ' +
        '— it is never handed a payment another partner collected. A retry ' +
        'sent after the first one answered is not idempotent: the token is ' +
        'spent by then, so it answers 400 and the caller has to read back ' +
        'its own payments to know whether the first attempt landed. The ' +
        'partner is read from the session and the capture mode from which ' +
        'credential was sent, so neither can be chosen by the caller. No ' +
        'response on this route discloses the wallet balance.',
    }),
    PaymentReceiptResponseDoc(),
    PaymentRequestErrorsDoc(),
    UnauthenticatedDoc(),
    PaymentForbiddenDoc(),
    PaymentWalletNotFoundDoc(),
    PaymentTokenSpentDoc(),
    PaymentTokenExpiredDoc(),
    InsufficientBalanceDoc(),
  );
};
