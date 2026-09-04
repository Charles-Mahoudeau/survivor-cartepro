import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ForbiddenRoleDoc,
  WalletNotFoundDoc,
  WalletResponseDoc,
} from '../commons';

export const GetMyWalletDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Read my wallet',
      description:
        'Returns the balance, currency, status and last movement of the wallet ' +
        'attached to the connected employee. Resolved from the session, never ' +
        'from a path id — a suspended wallet still answers 200, with its status.',
    }),
    WalletResponseDoc(),
    WalletNotFoundDoc(),
    ForbiddenRoleDoc(),
  );
};
