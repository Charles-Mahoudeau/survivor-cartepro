import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  ApplicationDetailResponseDoc,
  ApplicationNotFoundDoc,
  ApplicationNotPendingDoc,
  ApplicationValidationErrorsDoc,
} from '../commons';

export const ApproveApplicationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        'Approve a partner application and activate the partner (admin only)',
    }),
    ApplicationDetailResponseDoc(201),
    ApplicationValidationErrorsDoc(),
    ApplicationNotFoundDoc(),
    ApplicationNotPendingDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
