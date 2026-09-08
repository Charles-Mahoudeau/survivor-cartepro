import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc } from '@/common/docs';
import {
  AllocationAlreadyAppliedDoc,
  AllocationAppliedResponseDoc,
  AllocationNotFoundDoc,
} from '../commons';

export const ApplyAllocationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Apply an allocation',
      description:
        'Credits every active wallet of the employer, one movement each, and ' +
        'marks the allocation applied. Every line lands or none does. A ' +
        'suspended wallet is skipped and returned among the excluded. ' +
        'Calling it a second time answers 409 and credits nobody.',
    }),
    AllocationAppliedResponseDoc(),
    AllocationNotFoundDoc(),
    AllocationAlreadyAppliedDoc(),
    ForbiddenRoleDoc(),
  );
};
