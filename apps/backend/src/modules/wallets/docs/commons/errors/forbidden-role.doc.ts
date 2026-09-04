import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

/** Reused by every route restricted to a role — the code is the guard's, not the wallet's. */
export const ForbiddenRoleDoc = () => {
  return ApiResponse({
    status: 403,
    description: 'The session is valid, but its role cannot call this route.',
    examples: {
      [ERROR_CODES.FORBIDDEN_ROLE]: {
        summary: ERROR_CODES.FORBIDDEN_ROLE,
        value: { statusCode: 403, message: ERROR_CODES.FORBIDDEN_ROLE },
      },
    },
  });
};
