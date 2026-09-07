import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PartnerApplicationDetailResponseDto,
  PartnerApplicationOwnerSummaryDto,
} from '@/modules/partners/applications/dto';
import { PartnerCategorySummaryDto } from '@/modules/partners/core';

export const PartnerApplicationDetailResponseDoc = (status = 200) => {
  return applyDecorators(
    ApiExtraModels(
      PartnerApplicationDetailResponseDto,
      PartnerApplicationOwnerSummaryDto,
      PartnerCategorySummaryDto,
    ),
    ApiResponse({
      status,
      description: 'The full detail of a partner application dossier',
      schema: { $ref: getSchemaPath(PartnerApplicationDetailResponseDto) },
    }),
  );
};
