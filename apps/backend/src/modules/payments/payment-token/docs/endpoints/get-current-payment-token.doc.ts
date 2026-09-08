import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ForbiddenRoleDoc,
  PaymentTokenNotFoundDoc,
  PaymentTokenResponseDoc,
  UnauthenticatedDoc,
  WalletNotFoundDoc,
} from '../commons';

export const GetCurrentPaymentTokenDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get the current payment token' }),
    PaymentTokenResponseDoc(200),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
    WalletNotFoundDoc(),
    PaymentTokenNotFoundDoc(),
  );
};
