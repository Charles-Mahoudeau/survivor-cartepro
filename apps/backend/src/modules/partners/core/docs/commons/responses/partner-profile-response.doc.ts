import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PartnerProfileResponseDto } from '@/modules/partners/core/dto';

export const PartnerProfileResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(PartnerProfileResponseDto),
    ApiResponse({
      status: 200,
      description: 'A partner profile dossier',
      schema: { $ref: getSchemaPath(PartnerProfileResponseDto) },
    }),
  );
};
