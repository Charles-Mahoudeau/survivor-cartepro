import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UnauthenticatedDoc } from '@/common/docs';
import {
  ForbiddenRoleDoc,
  PartnerNotFoundDoc,
  PartnerProfileResponseDoc,
  PartnerValidationErrorsDoc,
} from '../commons';

export const UpdatePartnerProfileByIdDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update any partner profile dossier by partner ID (admin only)',
    }),
    PartnerProfileResponseDoc(),
    PartnerNotFoundDoc(),
    PartnerValidationErrorsDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
