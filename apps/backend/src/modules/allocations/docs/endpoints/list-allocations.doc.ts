import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForbiddenRoleDoc } from '@/common/docs';
import {
  AllocationPageResponseDoc,
  AllocationValidationErrorsDoc,
} from '../commons';

export const ListAllocationsDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'List the allocations',
      description:
        'Paginated list of every allocation of the dispositif, most recent ' +
        'first, drafts and applied ones alike.',
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Opaque cursor returned by a previous page',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      minimum: 1,
      maximum: 100,
      description: 'Number of allocations to return',
    }),
    AllocationPageResponseDoc(),
    AllocationValidationErrorsDoc(),
    ForbiddenRoleDoc(),
  );
};
