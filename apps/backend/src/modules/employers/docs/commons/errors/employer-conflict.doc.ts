import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const EmployerConflictDoc = () => {
  return ApiResponse({
    status: 409,
    description: 'Another employer already registers this SIREN.',
    examples: {
      [ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED]: {
        summary: ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED,
        value: {
          statusCode: 409,
          message: ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED,
        },
      },
    },
  });
};
