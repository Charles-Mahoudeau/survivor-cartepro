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
        'that already owns an employer, answers 422 — including when two ' +
        'creations race each other.',
    }),
    EmployerResponseDoc(),
    CreateEmployerValidationErrorsDoc(),
    EmployerOwnerNotFoundDoc(),
    EmployerConflictDoc(),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
  );
};
