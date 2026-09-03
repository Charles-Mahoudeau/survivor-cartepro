import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { WalletResponseDto } from '../../../validators/wallet.dto';

export const WalletResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(WalletResponseDto),
    ApiResponse({
      status: 200,
      description: 'The wallet of the connected employee.',
      schema: { $ref: getSchemaPath(WalletResponseDto) },
    }),
  );
};
