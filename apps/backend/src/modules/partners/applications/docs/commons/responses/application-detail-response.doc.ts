import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ApplicationDetailResponseDto,
  ApplicationOwnerSummaryDto,
} from '@/modules/partners/applications/dto';
import { PartnerCategorySummaryDto } from '@/modules/partners/core';

export const ApplicationDetailResponseDoc = (status = 200) => {
  return applyDecorators(
    ApiExtraModels(
      ApplicationDetailResponseDto,
      ApplicationOwnerSummaryDto,
      PartnerCategorySummaryDto,
    ),
    ApiResponse({
      status,
      description: 'The full detail of a partner application dossier',
      schema: { $ref: getSchemaPath(ApplicationDetailResponseDto) },
    }),
  );
};
