import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  ApplicationDetailResponseDoc,
  ApplicationNotFoundDoc,
} from '../commons';

export const GetMyApplicationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Get the caller's own partner application dossier",
    }),
    ApplicationDetailResponseDoc(),
    ApplicationNotFoundDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
