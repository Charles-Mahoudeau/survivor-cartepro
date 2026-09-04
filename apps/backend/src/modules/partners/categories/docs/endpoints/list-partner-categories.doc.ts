import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PartnerCategoryResponseDoc } from '../commons';

export const ListPartnerCategoriesDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'List partner categories' }),
    PartnerCategoryResponseDoc(true),
  );
};
