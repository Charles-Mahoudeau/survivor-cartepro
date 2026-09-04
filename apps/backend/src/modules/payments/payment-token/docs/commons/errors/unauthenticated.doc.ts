import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const UnauthenticatedDoc = () => {
  return ApiResponse({
    status: 401,
    description: 'Authentication is required',
    examples: {
      [ERROR_CODES.UNAUTHENTICATED]: {
        summary: ERROR_CODES.UNAUTHENTICATED,
        value: {
          statusCode: 401,
          message: ERROR_CODES.UNAUTHENTICATED,
        },
      },
    },
  });
};
