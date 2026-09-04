import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import { TransactionsCsvResponseDoc } from '../commons';

export const ExportTransactionsCsvDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Export every transaction as CSV',
      description:
        'The complete payment history of the dispositif as a CSV file, one ' +
        'transaction per line, oldest first. Columns, in this order: id, ' +
        'date_iso8601, employee_id, partner_id, amount_cents, status. Refused ' +
        'payments are included with their status. Administrators only.',
    }),
    TransactionsCsvResponseDoc(),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
  );
};
