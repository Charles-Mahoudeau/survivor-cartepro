import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UnauthenticatedDoc } from '@/common/docs';
import {
  ForbiddenRoleDoc,
  PartnerAlreadyExistsDoc,
  PartnerCategoryNotFoundDoc,
  PartnerCreationValidationErrorsDoc,
  PartnerProfileResponseDoc,
  PartnerSirenAlreadyRegisteredDoc,
} from '../commons';

export const CreatePartnerDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Deposit a partner dossier as the authenticated account',
      description:
        'Creates a partner dossier with status PENDING for the calling account and promotes it to role `partner`, atomically. Fails if the account already owns a dossier or already holds the `partner` or `admin` role.',
    }),
    PartnerProfileResponseDoc(201),
    PartnerCreationValidationErrorsDoc(),
    PartnerCategoryNotFoundDoc(),
    PartnerSirenAlreadyRegisteredDoc(),
    PartnerAlreadyExistsDoc(),
    ForbiddenRoleDoc(),
    UnauthenticatedDoc(),
  );
};
