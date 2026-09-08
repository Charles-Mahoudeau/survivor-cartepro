import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  ApplicationDetailResponseDoc,
  ApplicationNotFoundDoc,
  ApplicationNotPendingDoc,
  ApplicationValidationErrorsDoc,
} from '../commons';

export const DecideApplicationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Approve or refuse a partner application (admin only)',
    }),
    ApplicationDetailResponseDoc(201),
    ApplicationValidationErrorsDoc(),
    ApplicationNotFoundDoc(),
    ApplicationNotPendingDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
