import { ApiResponse } from '@nestjs/swagger';
import type { ErrorCode } from '@/common/constants/error-codes.constant';

/**
 * The single `403` of a route, carrying one example per code it can actually
 * raise.
 *
 * Grouped rather than one decorator per code because Swagger keys responses by
 * status: two `@ApiResponse({ status: 403 })` on the same handler would leave
 * only the last one. The codes are passed in so a route never documents a
 * refusal it cannot produce.
 */
export const ForbiddenDoc = (...codes: ErrorCode[]) =>
  ApiResponse({
    status: 403,
    description: 'The session is valid but the request is refused.',
    examples: Object.fromEntries(
      codes.map((code) => [
        code,
        {
          summary: code,
          value: { statusCode: 403, message: code, error: 'Forbidden' },
        },
      ]),
    ),
  });
