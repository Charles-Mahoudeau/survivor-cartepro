import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PartnerProfileResponseDto } from '@/modules/partners/core/dto';

export const PartnerProfileResponseDoc = (status = 200) => {
  return applyDecorators(
    ApiExtraModels(PartnerProfileResponseDto),
    ApiResponse({
      status,
      description: 'A partner profile dossier',
      schema: { $ref: getSchemaPath(PartnerProfileResponseDto) },
    }),
  );
};
