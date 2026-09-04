import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PartnerListResponseDto,
  PartnerResponseDto,
} from '@/modules/partners/core/dto';

export const PartnerListResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(PartnerListResponseDto, PartnerResponseDto),
    ApiResponse({
      status: 200,
      description: 'A page of active partners',
      schema: { $ref: getSchemaPath(PartnerListResponseDto) },
    }),
  );
};
