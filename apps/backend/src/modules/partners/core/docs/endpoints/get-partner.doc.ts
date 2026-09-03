import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PartnerNotFoundDoc, PartnerResponseDoc } from '../commons';

export const GetPartnerDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get an active partner by ID' }),
    PartnerResponseDoc(),
    PartnerNotFoundDoc(),
  );
};
