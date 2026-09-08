import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PaymentTokenNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description: 'The wallet has no live payment token.',
    examples: {
      [ERROR_CODES.PAYMENT_TOKEN_NOT_FOUND]: {
        summary: ERROR_CODES.PAYMENT_TOKEN_NOT_FOUND,
        value: {
          statusCode: 404,
          message: ERROR_CODES.PAYMENT_TOKEN_NOT_FOUND,
        },
      },
    },
  });
};
