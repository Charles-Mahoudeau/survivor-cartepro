import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PartnerApplicationDetailResponseDto,
  PartnerApplicationOwnerSummaryDto,
} from '@/modules/partners/applications/dto';
import { PartnerCategorySummaryDto } from '@/modules/partners/core';

export const PartnerApplicationDetailResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(
      PartnerApplicationDetailResponseDto,
      PartnerApplicationOwnerSummaryDto,
      PartnerCategorySummaryDto,
    ),
    ApiResponse({
      status: 200,
      description: 'The full detail of a partner application dossier',
      schema: { $ref: getSchemaPath(PartnerApplicationDetailResponseDto) },
    }),
  );
};
