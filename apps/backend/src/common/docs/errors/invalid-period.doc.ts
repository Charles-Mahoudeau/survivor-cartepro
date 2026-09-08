import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const InvalidPeriodDoc = () => {
  return ApiResponse({
    status: 422,
    description: 'The requested period starts after it ends.',
    examples: {
      [ERROR_CODES.INVALID_PERIOD]: {
        summary: ERROR_CODES.INVALID_PERIOD,
        value: { statusCode: 422, message: ERROR_CODES.INVALID_PERIOD },
      },
    },
  });
};
