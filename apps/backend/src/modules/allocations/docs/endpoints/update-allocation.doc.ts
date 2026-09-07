import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc } from '@/common/docs';
import {
  AllocationAlreadyAppliedDoc,
  AllocationDetailResponseDoc,
  AllocationNotFoundDoc,
  AllocationValidationErrorsDoc,
} from '../commons';

export const UpdateAllocationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Amend a draft allocation',
      description:
        'Changes the label, the amount, or both, and answers with the ' +
        'refreshed detail. The employer is fixed at creation: targeting ' +
        'another one is another campaign. An applied allocation answers 409.',
    }),
    AllocationDetailResponseDoc(),
    AllocationValidationErrorsDoc(),
    AllocationNotFoundDoc(),
    AllocationAlreadyAppliedDoc(),
    ForbiddenRoleDoc(),
  );
};
