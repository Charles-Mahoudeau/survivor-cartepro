import { BadRequestException } from '@nestjs/common';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { CaptureMode } from '@/modules/payments/core/enums';
import type { PaymentTokenLookup } from '@/modules/payments/payment-token/payment-token.contract';

/** How the employee's token reached the till, and how it is looked up. */
export interface PresentedPaymentToken {
  lookup: PaymentTokenLookup;
  captureMode: CaptureMode;
}

/**
 * Reads the one credential the request carries. The capture mode is derived
 * here rather than declared by the caller: a partner that could name it would
 * be free to record a typed code as a scan, in a row that never changes again.
 */
export function readPaymentCredential(credential: {
  qrPayload?: string;
  shortCode?: string;
}): PresentedPaymentToken {
  const { qrPayload, shortCode } = credential;

  if (qrPayload !== undefined && shortCode === undefined) {
    return { lookup: { qrPayload }, captureMode: CaptureMode.QR_CODE };
  }
  if (shortCode !== undefined && qrPayload === undefined) {
    return { lookup: { shortCode }, captureMode: CaptureMode.MANUAL_CODE };
  }

  throw new BadRequestException(ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID);
}
