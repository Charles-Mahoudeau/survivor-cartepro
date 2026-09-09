import { createSchema } from '@better-fetch/fetch';

import { paymentTokenSchema } from '../../../schemas/backend/payment-token';

export const paymentTokenEndpointsSchema = {
  '@post/me/payment-tokens': {
    method: 'post',
    output: paymentTokenSchema,
  },
  '@get/me/payment-tokens/current': {
    method: 'get',
    output: paymentTokenSchema,
  },
  '@delete/me/payment-tokens/current': {
    method: 'delete',
    output: undefined,
  },
} satisfies Parameters<typeof createSchema>[0];
