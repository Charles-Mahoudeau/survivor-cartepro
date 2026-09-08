import { applyDecorators } from '@nestjs/common';
import { ForbiddenRoleDoc, InvalidPeriodDoc } from '@/common/docs';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  WalletEntryPageResponseDoc,
  WalletEntryValidationErrorsDoc,
  WalletNotFoundDoc,
} from '../commons';

export const ListMyWalletEntriesDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'List my wallet movements',
      description:
        'Paginated history of the connected employee wallet, most recent ' +
        'first. A debit carries the partner name, a credit the allocation ' +
        'label. Without bounds the window is the last 30 days.',
    }),
    ApiQuery({
      name: 'from',
      required: false,
      type: String,
      format: 'date-time',
      description:
        'Start of the window, ISO 8601. Defaults to 30 days before the end',
    }),
    ApiQuery({
      name: 'to',
      required: false,
      type: String,
      format: 'date-time',
      description: 'End of the window, ISO 8601. Open when absent',
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
    WalletEntryValidationErrorsDoc(),
    WalletNotFoundDoc(),
    ForbiddenRoleDoc(),
    InvalidPeriodDoc(),
  );
};
