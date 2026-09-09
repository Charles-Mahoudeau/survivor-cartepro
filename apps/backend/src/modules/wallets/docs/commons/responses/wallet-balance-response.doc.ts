import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { WalletBalanceResponseDto } from '../../../validators/wallet-balance.dto';

export const WalletBalanceResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(WalletBalanceResponseDto),
    ApiResponse({
      status: 200,
      description: 'The balance of the targeted account wallet.',
      schema: { $ref: getSchemaPath(WalletBalanceResponseDto) },
    }),
  );
};
