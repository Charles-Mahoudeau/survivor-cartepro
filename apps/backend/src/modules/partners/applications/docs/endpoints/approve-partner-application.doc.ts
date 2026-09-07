import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  PartnerApplicationDetailResponseDoc,
  PartnerApplicationNotFoundDoc,
  PartnerApplicationNotPendingDoc,
  PartnerApplicationValidationErrorsDoc,
} from '../commons';

export const ApprovePartnerApplicationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        'Approve a partner application and activate the partner (admin only)',
    }),
    PartnerApplicationDetailResponseDoc(201),
    PartnerApplicationValidationErrorsDoc(),
    PartnerApplicationNotFoundDoc(),
    PartnerApplicationNotPendingDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
