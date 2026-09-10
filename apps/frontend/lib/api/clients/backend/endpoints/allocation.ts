import { createSchema } from '@better-fetch/fetch';
import { z } from 'zod';

import {
  allocationAppliedSchema,
  allocationDetailSchema,
  allocationPageSchema,
  allocationSchema,
  createAllocationSchema,
  listAllocationsQuerySchema,
} from '../../../schemas/backend/allocation';

const allocationParamsSchema = z.object({ allocationId: z.uuid() });

export const allocationEndpointsSchema = {
  '@get/allocations': {
    method: 'get',
    query: listAllocationsQuerySchema,
    output: allocationPageSchema,
  },
  '@post/allocations': {
    method: 'post',
    input: createAllocationSchema,
    output: allocationSchema,
  },
  '@get/allocations/:allocationId': {
    method: 'get',
    params: allocationParamsSchema,
    output: allocationDetailSchema,
  },
  '@post/allocations/:allocationId/apply': {
    method: 'post',
    params: allocationParamsSchema,
    output: allocationAppliedSchema,
  },
} satisfies Parameters<typeof createSchema>[0];
