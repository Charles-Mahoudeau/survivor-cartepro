import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const EmptyBalanceDoc = () => {
  return ApiResponse({
    status: 422,
    description: 'The wallet balance is zero or negative.',
    examples: {
      [ERROR_CODES.EMPTY_BALANCE]: {
        summary: ERROR_CODES.EMPTY_BALANCE,
        value: { statusCode: 422, message: ERROR_CODES.EMPTY_BALANCE },
      },
    },
  });
};
