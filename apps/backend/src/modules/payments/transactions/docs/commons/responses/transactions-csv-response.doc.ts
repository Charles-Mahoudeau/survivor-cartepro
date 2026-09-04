import { applyDecorators } from '@nestjs/common';
import { ApiProduces, ApiResponse } from '@nestjs/swagger';
import {
  CSV_LINE_BREAK,
  CSV_SEPARATOR,
  TRANSACTIONS_CSV_COLUMNS,
} from '../../../services/helpers/csv.helper';

const EXAMPLE = [
  TRANSACTIONS_CSV_COLUMNS.join(CSV_SEPARATOR),
  [
    '01a06b7c-14f1-7de6-9a6c-39de1891031d',
    '2026-09-02T14:20:00.000Z',
    '01a06b7c-14d7-7eea-9aee-c780e5c03b31',
    '01a06b7c-14e2-7bd4-8f13-7a2c0f6d9e21',
    '1250',
    'validated',
  ].join(CSV_SEPARATOR),
].join(CSV_LINE_BREAK);

export const TransactionsCsvResponseDoc = () => {
  return applyDecorators(
    ApiProduces('text/csv'),
    ApiResponse({
      status: 200,
      description:
        'Every payment, validated or refused, oldest first. UTF-8, ' +
        'semicolon-separated, one header line, no quoting.',
      content: {
        'text/csv': { schema: { type: 'string', example: EXAMPLE } },
      },
    }),
  );
};
