import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

export const PaymentWalletNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description: 'The token names a wallet that no longer exists.',
    examples: {
      [ERROR_CODES.WALLET_NOT_FOUND]: {
        summary: ERROR_CODES.WALLET_NOT_FOUND,
        value: { statusCode: 404, message: ERROR_CODES.WALLET_NOT_FOUND },
      },
    },
  });
};
