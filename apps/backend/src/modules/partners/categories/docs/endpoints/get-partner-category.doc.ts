import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PartnerCategoryResponseDoc } from '../commons';

export const GetPartnerCategoryDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get a partner category by slug' }),
    PartnerCategoryResponseDoc(),
  );
};
