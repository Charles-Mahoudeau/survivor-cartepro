import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PartnerCategoryNotFoundDoc = () => {
  return ApiResponse({
    status: 400,
    description: 'One or more category slugs do not exist',
    examples: {
      [ERROR_CODES.PARTNER_CATEGORY_NOT_FOUND]: {
        summary: ERROR_CODES.PARTNER_CATEGORY_NOT_FOUND,
        value: {
          statusCode: 400,
          message: ERROR_CODES.PARTNER_CATEGORY_NOT_FOUND,
        },
      },
    },
  });
};
