import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { BalanceResponseDto } from '../../../validators/balance.dto';

export const BalanceResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(BalanceResponseDto),
    ApiResponse({
      status: 200,
      description: 'The balance held by the targeted employee account.',
      schema: { $ref: getSchemaPath(BalanceResponseDto) },
      examples: {
        funded: {
          summary: 'An account with a spendable balance',
          value: { balance: '137.50', currency: 'EUR' },
        },
        empty: {
          summary: 'An account that has spent everything',
          value: { balance: '0.00', currency: 'EUR' },
        },
      },
    }),
  );
};
