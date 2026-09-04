import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PaymentTokenResponseDto } from '../../../validators';

export const PaymentTokenResponseDoc = (status: 200 | 201) => {
  return applyDecorators(
    ApiExtraModels(PaymentTokenResponseDto),
    ApiResponse({
      status,
      description: 'Payment token payload',
      schema: { $ref: getSchemaPath(PaymentTokenResponseDto) },
    }),
  );
};
