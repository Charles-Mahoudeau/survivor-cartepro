import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ForbiddenRoleDoc,
  WalletEntryPageResponseDoc,
  WalletNotFoundDoc,
} from '../commons';

export const ListMyWalletEntriesDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'List my wallet movements',
      description:
        'Paginated history of the connected employee wallet, most recent ' +
        'first. A debit carries the partner name, a credit the allocation label.',
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
      description: 'Number of entries to return',
    }),
    WalletEntryPageResponseDoc(),
    WalletNotFoundDoc(),
    ForbiddenRoleDoc(),
  );
};
