import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UnauthenticatedDoc } from '@/common/docs';
import {
  ForbiddenRoleDoc,
  PartnerNotFoundDoc,
  PartnerProfileResponseDoc,
  PartnerValidationErrorsDoc,
} from '../commons';

export const UpdateMyPartnerProfileDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update the profile dossier for the authenticated partner',
    }),
    PartnerProfileResponseDoc(),
    PartnerNotFoundDoc(),
    PartnerValidationErrorsDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
