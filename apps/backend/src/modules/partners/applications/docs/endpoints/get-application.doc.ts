import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  ApplicationDetailResponseDoc,
  ApplicationNotFoundDoc,
} from '../commons';

export const GetApplicationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        'Get the full detail of a partner application dossier (admin only)',
    }),
    ApplicationDetailResponseDoc(),
    ApplicationNotFoundDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
