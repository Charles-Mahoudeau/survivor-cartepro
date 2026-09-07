import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  PartnerApplicationDetailResponseDoc,
  PartnerApplicationNotFoundDoc,
} from '../commons';

export const GetPartnerApplicationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        'Get the full detail of a partner application dossier (admin only)',
    }),
    PartnerApplicationDetailResponseDoc(),
    PartnerApplicationNotFoundDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
