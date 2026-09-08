import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  AllocationPageResponseDto,
  AllocationResponseDto,
} from '../../../validators/allocation.dto';

export const AllocationPageResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(AllocationPageResponseDto, AllocationResponseDto),
    ApiResponse({
      status: 200,
      description: 'A page of allocations, most recent first.',
      schema: { $ref: getSchemaPath(AllocationPageResponseDto) },
    }),
  );
};
