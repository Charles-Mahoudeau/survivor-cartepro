import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  AccountBannedDoc,
  EmptyBalanceDoc,
  ForbiddenRoleDoc,
  PaymentTokenResponseDoc,
  UnauthenticatedDoc,
  WalletNotFoundDoc,
} from '../commons';

export const CreatePaymentTokenDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a payment token',
      description:
        'Revokes the wallet’s previous live token and issues a new ' +
        'one, refusing a disabled wallet or a balance at or below zero.',
    }),
    PaymentTokenResponseDoc(201),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
    WalletNotFoundDoc(),
    AccountBannedDoc(),
    EmptyBalanceDoc(),
  );
};
