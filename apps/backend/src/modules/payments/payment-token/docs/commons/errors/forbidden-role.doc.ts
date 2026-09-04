import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const ForbiddenRoleDoc = () => {
  return ApiResponse({
    status: 403,
    description: 'The account role is not allowed',
    examples: {
      [ERROR_CODES.FORBIDDEN_ROLE]: {
        summary: ERROR_CODES.FORBIDDEN_ROLE,
        value: {
          statusCode: 403,
          message: ERROR_CODES.FORBIDDEN_ROLE,
        },
      },
    },
  });
};
