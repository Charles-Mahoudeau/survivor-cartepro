import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const ApplicationNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description: 'No such partner application dossier',
    examples: {
      [ERROR_CODES.PARTNER_NOT_FOUND]: {
        summary: ERROR_CODES.PARTNER_NOT_FOUND,
        value: {
          statusCode: 404,
          message: ERROR_CODES.PARTNER_NOT_FOUND,
        },
      },
    },
  });
};
