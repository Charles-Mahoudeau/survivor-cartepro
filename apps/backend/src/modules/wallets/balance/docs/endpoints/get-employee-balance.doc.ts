import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  BalanceResponseDoc,
  BalanceValidationErrorsDoc,
  EmployeeIdParamDoc,
  WalletNotFoundDoc,
} from '../commons';

export const GetEmployeeBalanceDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Read an employee balance',
      description:
        'Reads the balance of a single employee account. The amount is a decimal string in the currency the same response carries, never a number, so no client rounds it on the way in. An identifier that holds no balance answers 404 with the same body whether the account is unknown or holds no wallet.',
    }),
    EmployeeIdParamDoc(),
    BalanceResponseDoc(),
    BalanceValidationErrorsDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
    WalletNotFoundDoc(),
  );
};
