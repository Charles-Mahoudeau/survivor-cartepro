import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ForbiddenRoleDoc,
  PaymentTokenNotFoundDoc,
  UnauthenticatedDoc,
  WalletNotFoundDoc,
} from '../commons';

export const RevokeCurrentPaymentTokenDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke the current payment token',
      description:
        'Revokes the wallet’s live token so it can no longer be redeemed.',
    }),
    ApiResponse({ status: 204, description: 'The live token was revoked' }),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
    WalletNotFoundDoc(),
    PaymentTokenNotFoundDoc(),
  );
};
