import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const AccountBannedDoc = () => {
  return ApiResponse({
    status: 403,
    description: 'The account is banned, or the wallet is disabled.',
    examples: {
      [ERROR_CODES.ACCOUNT_BANNED]: {
        summary: ERROR_CODES.ACCOUNT_BANNED,
        value: { statusCode: 403, message: ERROR_CODES.ACCOUNT_BANNED },
      },
    },
  });
};
