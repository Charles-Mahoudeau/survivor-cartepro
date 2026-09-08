import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PaymentTokenExpiredDoc = () => {
  return ApiResponse({
    status: 410,
    description:
      'The token outlived its window. The employee reissues one and the ' +
      'partner scans again.',
    examples: {
      [ERROR_CODES.PAYMENT_TOKEN_EXPIRED]: {
        summary: ERROR_CODES.PAYMENT_TOKEN_EXPIRED,
        value: {
          statusCode: 410,
          message: ERROR_CODES.PAYMENT_TOKEN_EXPIRED,
        },
      },
    },
  });
};
