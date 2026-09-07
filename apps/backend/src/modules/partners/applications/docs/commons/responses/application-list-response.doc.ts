import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ApplicationListResponseDto,
  ApplicationResponseDto,
} from '@/modules/partners/applications/dto';

export const ApplicationListResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(ApplicationListResponseDto, ApplicationResponseDto),
    ApiResponse({
      status: 200,
      description: 'A page of partner applications',
      schema: { $ref: getSchemaPath(ApplicationListResponseDto) },
    }),
  );
};
