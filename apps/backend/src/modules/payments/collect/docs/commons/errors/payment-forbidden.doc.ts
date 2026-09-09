import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PaymentForbiddenDoc = () => {
  return ApiResponse({
    status: 403,
    description:
      'The caller may not collect: wrong role, no active partner behind the ' +
      'account, or a suspended wallet on the paying side.',
    examples: {
      [ERROR_CODES.FORBIDDEN_ROLE]: {
        summary: ERROR_CODES.FORBIDDEN_ROLE,
        value: { statusCode: 403, message: ERROR_CODES.FORBIDDEN_ROLE },
      },
      [ERROR_CODES.PARTNER_NOT_ACTIVE]: {
        summary: ERROR_CODES.PARTNER_NOT_ACTIVE,
        value: { statusCode: 403, message: ERROR_CODES.PARTNER_NOT_ACTIVE },
      },
      [ERROR_CODES.ACCOUNT_BANNED]: {
        summary: ERROR_CODES.ACCOUNT_BANNED,
        value: { statusCode: 403, message: ERROR_CODES.ACCOUNT_BANNED },
      },
    },
  });
};
