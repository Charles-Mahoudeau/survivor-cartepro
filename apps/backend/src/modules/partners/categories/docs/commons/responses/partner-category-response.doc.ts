import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PartnerCategoryResponseDto } from '@/modules/partners/categories/dto';

export const PartnerCategoryResponseDoc = (isArray = false) => {
  return applyDecorators(
    ApiExtraModels(PartnerCategoryResponseDto),
    ApiResponse({
      status: 200,
      description: isArray
        ? 'List of partner categories'
        : 'A partner category',
      schema: isArray
        ? {
            type: 'array',
            items: { $ref: getSchemaPath(PartnerCategoryResponseDto) },
          }
        : { $ref: getSchemaPath(PartnerCategoryResponseDto) },
    }),
  );
};
