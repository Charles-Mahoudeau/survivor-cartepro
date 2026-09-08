import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const AllocationAlreadyAppliedDoc = () => {
  return ApiResponse({
    status: 409,
    description: 'The allocation is applied, and an applied one never changes.',
    examples: {
      [ERROR_CODES.ALLOCATION_ALREADY_APPLIED]: {
        summary: ERROR_CODES.ALLOCATION_ALREADY_APPLIED,
        value: {
          statusCode: 409,
          message: ERROR_CODES.ALLOCATION_ALREADY_APPLIED,
        },
      },
    },
  });
};
