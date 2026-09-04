import { createSchema } from '@better-fetch/fetch';
import { z } from 'zod';

import { partnerCategorySchema } from '../../../schemas/backend/partner-category';

const partnerCategoryParamsSchema = z.object({
  slug: z.string(),
});

export const partnerCategoryEndpointsSchema = {
  '@get/partners/categories': {
    method: 'get',
    output: z.array(partnerCategorySchema),
  },
  /** The backend answers an empty body, not a 404, for an unknown slug. */
  '@get/partners/categories/:slug': {
    method: 'get',
    params: partnerCategoryParamsSchema,
    output: partnerCategorySchema.nullable(),
  },
} satisfies Parameters<typeof createSchema>[0];
