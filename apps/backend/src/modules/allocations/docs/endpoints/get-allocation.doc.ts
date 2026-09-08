import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ForbiddenRoleDoc } from '@/common/docs';
import { AllocationDetailResponseDoc, AllocationNotFoundDoc } from '../commons';

export const GetAllocationDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Read an allocation and who it credits',
      description:
        'Returns the allocation, the wallets it credits, the wallets it ' +
        'skips with the reason, and the total it moves.',
    }),
    AllocationDetailResponseDoc(),
    AllocationNotFoundDoc(),
    ForbiddenRoleDoc(),
  );
};
