import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc, UnauthenticatedDoc } from '@/common/docs';
import {
  CreateEmployerValidationErrorsDoc,
  EmployerConflictDoc,
  EmployerResponseDoc,
} from '../commons';

export const CreateEmployerDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Register an employer',
      description:
        'Registers an employer the administration can target with an ' +
        'allocation. A SIREN already registered answers 409 — including when ' +
        'two creations race each other. Partner registration answers the same ' +
        'code for the same class of refusal.',
    }),
    EmployerResponseDoc(),
    CreateEmployerValidationErrorsDoc(),
    EmployerConflictDoc(),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
  );
};
