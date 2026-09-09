import { createSchema } from '@better-fetch/fetch';
import { z } from 'zod';

import {
  applicationDetailSchema,
  applicationPageSchema,
  decideApplicationSchema,
  listApplicationsQuerySchema,
} from '../../../schemas/backend/partner-application';

const applicationParamsSchema = z.object({
  applicationId: z.uuid(),
});

export const partnerApplicationEndpointsSchema = {
  '@get/partners/applications': {
    method: 'get',
    query: listApplicationsQuerySchema,
    output: applicationPageSchema,
  },
  '@get/partners/applications/:applicationId': {
    method: 'get',
    params: applicationParamsSchema,
    output: applicationDetailSchema,
  },
  '@post/partners/applications/:applicationId/decision': {
    method: 'post',
    params: applicationParamsSchema,
    input: decideApplicationSchema,
    output: applicationDetailSchema,
  },
} satisfies Parameters<typeof createSchema>[0];
