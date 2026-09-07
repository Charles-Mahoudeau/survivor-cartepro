import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

/** The two uniqueness rules of the register share one status code. */
export const EmployerConflictDoc = () => {
  return ApiResponse({
    status: 422,
    description: 'The SIREN or the owner is already taken by another employer.',
    examples: {
      [ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED]: {
        summary: ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED,
        value: {
          statusCode: 422,
          message: ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED,
        },
      },
      [ERROR_CODES.EMPLOYER_OWNER_ALREADY_ASSIGNED]: {
        summary: ERROR_CODES.EMPLOYER_OWNER_ALREADY_ASSIGNED,
        value: {
          statusCode: 422,
          message: ERROR_CODES.EMPLOYER_OWNER_ALREADY_ASSIGNED,
        },
      },
    },
  });
};
