import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc } from '@/common/docs';
import {
  EmployerConflictDoc,
  EmployerOwnerNotFoundDoc,
  EmployerResponseDoc,
  EmployerValidationErrorsDoc,
} from '../commons';

export const CreateEmployerDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Register an employer',
      description:
        'Registers an employer under an existing account, which becomes the ' +
        'one that administers it. A SIREN already registered, or an account ' +
        'that already owns an employer, answers 422.',
    }),
    EmployerResponseDoc(),
    EmployerValidationErrorsDoc(),
    EmployerOwnerNotFoundDoc(),
    EmployerConflictDoc(),
    ForbiddenRoleDoc(),
  );
};
