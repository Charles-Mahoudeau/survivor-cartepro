import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  CreateEmployerValidationErrorsDoc,
  EmployerConflictDoc,
  EmployerOwnerNotFoundDoc,
  EmployerResponseDoc,
} from '../commons';

export const CreateEmployerDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Register an employer',
      description:
        'Registers an employer under an existing account, which becomes the ' +
        'one that administers it. A SIREN already registered, or an account ' +
        'that already owns an employer, answers 409 — including when two ' +
        'creations race each other. Partner registration answers the same ' +
        'code for the same class of refusal.',
    }),
    EmployerResponseDoc(),
    CreateEmployerValidationErrorsDoc(),
    EmployerOwnerNotFoundDoc(),
    EmployerConflictDoc(),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
  );
};
