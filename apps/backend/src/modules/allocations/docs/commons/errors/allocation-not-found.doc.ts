import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const AllocationNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description: 'No allocation carries this identifier.',
    examples: {
      [ERROR_CODES.ALLOCATION_NOT_FOUND]: {
        summary: ERROR_CODES.ALLOCATION_NOT_FOUND,
        value: { statusCode: 404, message: ERROR_CODES.ALLOCATION_NOT_FOUND },
      },
    },
  });
};
