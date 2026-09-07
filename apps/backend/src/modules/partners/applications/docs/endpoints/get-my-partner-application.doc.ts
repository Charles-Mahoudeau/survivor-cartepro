import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  PartnerApplicationDetailResponseDoc,
  PartnerApplicationNotFoundDoc,
} from '../commons';

export const GetMyPartnerApplicationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Get the caller's own partner application dossier",
    }),
    PartnerApplicationDetailResponseDoc(),
    PartnerApplicationNotFoundDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
