import { z } from 'zod';

/** Read aloud over a counter, so its glyphs are the unambiguous ones. */
export const SHORT_CODE_LENGTH = 8;

export const paymentTokenSchema = z.object({
  token: z.uuid(),
  qrPayload: z.string().min(1),
  shortCode: z.string().length(SHORT_CODE_LENGTH),
  expiresAt: z.iso.datetime({ offset: true }),
});

export type PaymentToken = z.infer<typeof paymentTokenSchema>;
