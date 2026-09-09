import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PaymentRequestErrorsDoc = () => {
  return ApiResponse({
    status: 400,
    description:
      'The request is malformed, or the credential resolves to no live ' +
      'token. An amount is a positive number of euros with at most two ' +
      'decimals; a short code is eight uppercase letters or digits.',
    examples: {
      [ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID]: {
        summary: ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID,
        value: {
          statusCode: 400,
          message: ERROR_CODES.PAYMENT_TOKEN_LOOKUP_INVALID,
        },
      },
      [ERROR_CODES.PAYMENT_TOKEN_INVALID]: {
        summary: ERROR_CODES.PAYMENT_TOKEN_INVALID,
        value: {
          statusCode: 400,
          message: ERROR_CODES.PAYMENT_TOKEN_INVALID,
        },
      },
    },
  });
};
