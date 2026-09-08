import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PartnerSirenAlreadyRegisteredDoc = () => {
  return ApiResponse({
    status: 409,
    description: 'The SIREN is already registered to another partner dossier',
    examples: {
      [ERROR_CODES.PARTNER_SIREN_ALREADY_REGISTERED]: {
        summary: ERROR_CODES.PARTNER_SIREN_ALREADY_REGISTERED,
        value: {
          statusCode: 409,
          message: ERROR_CODES.PARTNER_SIREN_ALREADY_REGISTERED,
        },
      },
    },
  });
};
