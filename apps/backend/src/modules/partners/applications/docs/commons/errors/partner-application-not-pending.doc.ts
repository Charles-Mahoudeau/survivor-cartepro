import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PartnerApplicationNotPendingDoc = () => {
  return ApiResponse({
    status: 409,
    description: 'The application has already been decided',
    examples: {
      [ERROR_CODES.PARTNER_NOT_PENDING]: {
        summary: ERROR_CODES.PARTNER_NOT_PENDING,
        value: {
          statusCode: 409,
          message: ERROR_CODES.PARTNER_NOT_PENDING,
        },
      },
    },
  });
};
