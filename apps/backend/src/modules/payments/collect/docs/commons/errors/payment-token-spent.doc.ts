import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PaymentTokenSpentDoc = () => {
  return ApiResponse({
    status: 409,
    description:
      'The token cannot pay again: the employee revoked it, or it already ' +
      'paid — another partner, or this one for a different amount.',
    examples: {
      [ERROR_CODES.PAYMENT_TOKEN_REVOKED]: {
        summary: ERROR_CODES.PAYMENT_TOKEN_REVOKED,
        value: {
          statusCode: 409,
          message: ERROR_CODES.PAYMENT_TOKEN_REVOKED,
        },
      },
      [ERROR_CODES.PAYMENT_TOKEN_ALREADY_USED]: {
        summary: ERROR_CODES.PAYMENT_TOKEN_ALREADY_USED,
        value: {
          statusCode: 409,
          message: ERROR_CODES.PAYMENT_TOKEN_ALREADY_USED,
        },
      },
    },
  });
};
