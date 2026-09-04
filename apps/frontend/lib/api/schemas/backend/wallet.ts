import { z } from 'zod';

import { amountSchema } from '../common/amount';

export const walletStatusSchema = z.enum(['active', 'disabled']);
export const walletEntryDirectionSchema = z.enum(['credit', 'debit']);

export const walletLastMovementSchema = z.object({
  amount: amountSchema,
  direction: walletEntryDirectionSchema,
  createdAt: z.iso.datetime({ offset: true }),
});

export const walletSchema = z.object({
  balance: amountSchema,
  currency: z.string(),
  status: walletStatusSchema,
  lastMovement: walletLastMovementSchema.nullable(),
});

export type WalletStatus = z.infer<typeof walletStatusSchema>;
export type WalletEntryDirection = z.infer<typeof walletEntryDirectionSchema>;
export type WalletLastMovement = z.infer<typeof walletLastMovementSchema>;
export type Wallet = z.infer<typeof walletSchema>;
