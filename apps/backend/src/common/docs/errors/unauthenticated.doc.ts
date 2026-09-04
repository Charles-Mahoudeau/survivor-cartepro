import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

/** Raised by `SessionGuard` on every route without `@Public()`. */
export const UnauthenticatedDoc = () => {
  return ApiResponse({
    status: 401,
    description: 'No session on the request, or it has expired.',
    examples: {
      [ERROR_CODES.UNAUTHENTICATED]: {
        summary: ERROR_CODES.UNAUTHENTICATED,
        value: { statusCode: 401, message: ERROR_CODES.UNAUTHENTICATED },
      },
    },
  });
};
