import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  AllocationAppliedResponseDto,
  AllocationExcludedDto,
} from '../../../validators/allocation.dto';

export const AllocationAppliedResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(AllocationAppliedResponseDto, AllocationExcludedDto),
    ApiResponse({
      status: 200,
      description: 'What the apply credited, and what it skipped.',
      schema: { $ref: getSchemaPath(AllocationAppliedResponseDto) },
    }),
  );
};
