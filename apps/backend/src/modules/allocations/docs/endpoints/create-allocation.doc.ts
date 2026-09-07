import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc } from '@/common/docs';
import {
  AllocationResponseDoc,
  AllocationValidationErrorsDoc,
  EmployerNotFoundDoc,
} from '../commons';

export const CreateAllocationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Prepare an allocation',
      description:
        'Creates the allocation as a draft, credited to nobody until it is ' +
        'applied. The amount is what each active wallet of the employer will ' +
        'receive, not the total.',
    }),
    AllocationResponseDoc(201),
    AllocationValidationErrorsDoc(),
    EmployerNotFoundDoc(),
    ForbiddenRoleDoc(),
  );
};
