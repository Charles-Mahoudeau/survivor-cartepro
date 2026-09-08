import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  EmployerPageResponseDto,
  EmployerResponseDto,
} from '../../../validators/employer.dto';

export const EmployerPageResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(EmployerPageResponseDto, EmployerResponseDto),
    ApiResponse({
      status: 200,
      description:
        'A page of employers, most recently registered first, each with the ' +
        'number of wallets an allocation would credit.',
      schema: { $ref: getSchemaPath(EmployerPageResponseDto) },
    }),
  );
};
