import { createSchema } from '@better-fetch/fetch';

import { paginationQuerySchema } from '../../../schemas/common';
import { walletSchema } from '../../../schemas/backend/wallet';
import { walletEntryPageSchema } from '../../../schemas/backend/wallet-entry';

export const walletEndpointsSchema = {
  '@get/me/wallet': {
    method: 'get',
    output: walletSchema,
  },
  '@get/me/wallet/entries': {
    method: 'get',
    query: paginationQuerySchema,
    output: walletEntryPageSchema,
  },
} satisfies Parameters<typeof createSchema>[0];
