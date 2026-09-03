import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PartnerResponseDto } from '@/modules/partners/core/dto';

export const PartnerResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(PartnerResponseDto),
    ApiResponse({
      status: 200,
      description: 'A partner',
      schema: { $ref: getSchemaPath(PartnerResponseDto) },
    }),
  );
};
