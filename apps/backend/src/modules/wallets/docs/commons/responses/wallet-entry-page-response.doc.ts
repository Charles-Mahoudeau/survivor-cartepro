import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  WalletEntryPageResponseDto,
  WalletEntryResponseDto,
} from '../../../validators/wallet-entry.dto';

export const WalletEntryPageResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(WalletEntryPageResponseDto, WalletEntryResponseDto),
    ApiResponse({
      status: 200,
      description:
        'A page of the connected employee wallet movements, most recent first.',
      schema: { $ref: getSchemaPath(WalletEntryPageResponseDto) },
    }),
  );
};
