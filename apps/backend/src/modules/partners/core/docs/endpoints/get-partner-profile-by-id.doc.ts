import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UnauthenticatedDoc } from '@/common/docs';
import {
  ForbiddenRoleDoc,
  PartnerNotFoundDoc,
  PartnerProfileResponseDoc,
} from '../commons';

export const GetPartnerProfileByIdDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get any partner profile dossier by partner ID (admin only)',
    }),
    PartnerProfileResponseDoc(),
    PartnerNotFoundDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
