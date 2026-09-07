import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForbiddenRoleDoc } from '@/common/docs';
import {
  EmployerPageResponseDoc,
  EmployerValidationErrorsDoc,
} from '../commons';

export const ListEmployersDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'List the employers',
      description:
        'Paginated list of the registered employers, each carrying how many ' +
        'wallets an allocation targeting it would credit today. A suspended ' +
        'wallet is not counted.',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Opaque cursor returned by a previous page',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      minimum: 1,
      maximum: 100,
      description: 'Number of employers to return',
    }),
    EmployerPageResponseDoc(),
    EmployerValidationErrorsDoc(),
    ForbiddenRoleDoc(),
  );
};
