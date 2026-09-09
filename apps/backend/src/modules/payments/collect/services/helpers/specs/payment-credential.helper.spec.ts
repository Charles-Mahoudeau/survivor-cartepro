import { BadRequestException } from '@nestjs/common';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { CaptureMode } from '@/modules/payments/core/enums';
import { readPaymentCredential } from '../payment-credential.helper';

describe('readPaymentCredential', () => {
  it('reads a scan as a QR lookup', () => {
    expect(readPaymentCredential({ qrPayload: 'body.signature' })).toEqual({
      lookup: { qrPayload: 'body.signature' },
      captureMode: CaptureMode.QR_CODE,
    });
  });

  it('reads a typed code as a short-code lookup', () => {
    expect(readPaymentCredential({ shortCode: 'AB12CD34' })).toEqual({
      lookup: { shortCode: 'AB12CD34' },
      captureMode: CaptureMode.MANUAL_CODE,
    });
  });

  it('refuses a request carrying neither credential', () => {
    expect(() => readPaymentCredential({})).toThrow(BadRequestException);
    expect(() => readPaymentCredential({})).toThrow(
      ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID,
    );
  });

  it('refuses a request carrying both credentials', () => {
    expect(() =>
      readPaymentCredential({
        qrPayload: 'body.signature',
        shortCode: 'AB12CD34',
      }),
    ).toThrow(ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID);
  });
});
