import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PartnerAlreadyExistsDoc = () => {
  return ApiResponse({
    status: 409,
    description: 'The authenticated account already owns a partner dossier',
    examples: {
      [ERROR_CODES.PARTNER_ALREADY_EXISTS]: {
        summary: ERROR_CODES.PARTNER_ALREADY_EXISTS,
        value: {
          statusCode: 409,
          message: ERROR_CODES.PARTNER_ALREADY_EXISTS,
        },
      },
    },
  });
};
