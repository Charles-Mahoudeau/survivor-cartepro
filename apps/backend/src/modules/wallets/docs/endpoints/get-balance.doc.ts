import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import { WalletBalanceResponseDoc, WalletNotFoundDoc } from '../commons';

export const GetBalanceDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Read an account balance',
      description:
        'Admin-only lookup of the wallet balance for any account, by user id.',
    }),
    WalletBalanceResponseDoc(),
    WalletNotFoundDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
