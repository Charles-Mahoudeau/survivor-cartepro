import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PaymentReceiptResponseDto } from '../../../validators';

export const PaymentReceiptResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(PaymentReceiptResponseDto),
    ApiResponse({
      status: 201,
      description: 'The settled payment, as the till needs to print it.',
      schema: { $ref: getSchemaPath(PaymentReceiptResponseDto) },
    }),
  );
};
