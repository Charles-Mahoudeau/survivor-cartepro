import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PartnerListResponseDoc, PartnerValidationErrorsDoc } from '../commons';

export const ListPartnersDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'List active partners' }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search partner names and city, up to 100 characters',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      type: String,
      description: 'Filter by category slug, up to 100 characters',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Opaque cursor returned by a previous page',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      minimum: 1,
      maximum: 100,
      description: 'Number of partners to return',
    }),
    PartnerListResponseDoc(),
    PartnerValidationErrorsDoc(),
  );
};
