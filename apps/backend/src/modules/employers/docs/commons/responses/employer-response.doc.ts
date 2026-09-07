import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { EmployerResponseDto } from '../../../validators/employer.dto';

export const EmployerResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(EmployerResponseDto),
    ApiResponse({
      status: 201,
      description: 'The employer just registered.',
      schema: { $ref: getSchemaPath(EmployerResponseDto) },
    }),
  );
};
