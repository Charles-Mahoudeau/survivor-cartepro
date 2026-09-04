import { createSchema } from '@better-fetch/fetch';
import { z } from 'zod';

import {
  listPartnersQuerySchema,
  partnerPageSchema,
  partnerSchema,
} from '../../../schemas/backend/partner';

const partnerParamsSchema = z.object({
  partnerId: z.uuid(),
});

export const partnerEndpointsSchema = {
  '@get/partners': {
    method: 'get',
    query: listPartnersQuerySchema,
    output: partnerPageSchema,
  },
  '@get/partners/:partnerId': {
    method: 'get',
    params: partnerParamsSchema,
    output: partnerSchema,
  },
} satisfies Parameters<typeof createSchema>[0];
