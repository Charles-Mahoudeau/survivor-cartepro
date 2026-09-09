import { createSchema } from '@better-fetch/fetch';

import {
  collectPaymentSchema,
  paymentReceiptSchema,
} from '../../../schemas/backend/payment';

export const paymentEndpointsSchema = {
  '@post/payments': {
    method: 'post',
    input: collectPaymentSchema,
    output: paymentReceiptSchema,
  },
} satisfies Parameters<typeof createSchema>[0];
