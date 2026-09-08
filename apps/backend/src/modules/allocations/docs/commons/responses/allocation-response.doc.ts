import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { AllocationResponseDto } from '../../../validators/allocation.dto';

export const AllocationResponseDoc = (status: 200 | 201 = 200) => {
  return applyDecorators(
    ApiExtraModels(AllocationResponseDto),
    ApiResponse({
      status,
      description: 'The allocation.',
      schema: { $ref: getSchemaPath(AllocationResponseDto) },
    }),
  );
};
