import { z } from 'zod';

import { amountSchema } from '../common/amount';
import { cursorPageSchema } from '../common/cursor-page';
import { walletEntryDirectionSchema } from './wallet';

export const walletEntryKindSchema = z.enum([
  'payment_sent',
  'payment_received',
  'refund_sent',
  'refund_received',
  'allocation_received',
]);

export const walletEntrySchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime({ offset: true }),
  direction: walletEntryDirectionSchema,
  amount: amountSchema,
  kind: walletEntryKindSchema,
  /** The partner name for a payment, the allocation label for a credit. */
  label: z.string().nullable(),
});

export const walletEntryPageSchema = cursorPageSchema(walletEntrySchema);

export type WalletEntryKind = z.infer<typeof walletEntryKindSchema>;
export type WalletEntry = z.infer<typeof walletEntrySchema>;
export type WalletEntryPage = z.infer<typeof walletEntryPageSchema>;
