import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const InsufficientBalanceDoc = () => {
  return ApiResponse({
    status: 422,
    description:
      'The wallet cannot absorb the debit. The refusal names no figure: what ' +
      'the wallet holds is the employee’s to disclose, not the till’s to read.',
    examples: {
      [ERROR_CODES.INSUFFICIENT_BALANCE]: {
        summary: ERROR_CODES.INSUFFICIENT_BALANCE,
        value: { statusCode: 422, message: ERROR_CODES.INSUFFICIENT_BALANCE },
      },
    },
  });
};
