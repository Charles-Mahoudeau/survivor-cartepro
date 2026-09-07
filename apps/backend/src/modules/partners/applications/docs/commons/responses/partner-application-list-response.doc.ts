import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PartnerApplicationListResponseDto,
  PartnerApplicationResponseDto,
} from '@/modules/partners/applications/dto';

export const PartnerApplicationListResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(
      PartnerApplicationListResponseDto,
      PartnerApplicationResponseDto,
    ),
    ApiResponse({
      status: 200,
      description: 'A page of partner applications',
      schema: { $ref: getSchemaPath(PartnerApplicationListResponseDto) },
    }),
  );
};
