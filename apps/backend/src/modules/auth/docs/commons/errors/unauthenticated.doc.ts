import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

/**
 * Raised by `SessionGuard` when the request carries no session cookie, or one
 * that no longer resolves.
 */
export const UnauthenticatedDoc = () =>
  ApiResponse({
    status: 401,
    description: 'No session, or the session has expired.',
    examples: {
      [ERROR_CODES.UNAUTHENTICATED]: {
        summary: ERROR_CODES.UNAUTHENTICATED,
        value: {
          statusCode: 401,
          message: ERROR_CODES.UNAUTHENTICATED,
          error: 'Unauthorized',
        },
      },
    },
  });
