import { createSchema } from '@better-fetch/fetch';

import {
  employerPageSchema,
  listEmployersQuerySchema,
} from '../../../schemas/backend/employer';

export const employerEndpointsSchema = {
  '@get/employers': {
    method: 'get',
    query: listEmployersQuerySchema,
    output: employerPageSchema,
  },
} satisfies Parameters<typeof createSchema>[0];
