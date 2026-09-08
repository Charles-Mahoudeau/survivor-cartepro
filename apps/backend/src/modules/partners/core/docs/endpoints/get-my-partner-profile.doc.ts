import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UnauthenticatedDoc } from '@/common/docs';
import {
  ForbiddenRoleDoc,
  PartnerNotFoundDoc,
  PartnerProfileResponseDoc,
} from '../commons';

export const GetMyPartnerProfileDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the profile dossier for the authenticated partner',
    }),
    PartnerProfileResponseDoc(),
    PartnerNotFoundDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
