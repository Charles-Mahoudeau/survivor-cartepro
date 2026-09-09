import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';

/** An unknown identifier and an account without a wallet answer alike. */
export const WalletNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description:
      'No balance is held for this identifier. An identifier that matches no account and an account that holds no wallet return the same body, so the route never confirms whether an account exists.',
    examples: {
      [ERROR_CODES.WALLET_NOT_FOUND]: {
        summary: ERROR_CODES.WALLET_NOT_FOUND,
        value: { statusCode: 404, message: ERROR_CODES.WALLET_NOT_FOUND },
      },
    },
  });
};
