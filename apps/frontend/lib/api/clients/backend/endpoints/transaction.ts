import { createSchema } from '@better-fetch/fetch';

import { transactionsCsvSchema } from '../../../schemas/backend/transaction';

export const transactionEndpointsSchema = {
  '@get/admin/transactions.csv': {
    method: 'get',
    output: transactionsCsvSchema,
  },
} satisfies Parameters<typeof createSchema>[0];
