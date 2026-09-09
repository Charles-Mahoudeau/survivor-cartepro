import { z } from 'zod';

import { SHORT_CODE_LENGTH } from './payment-token';

/** Mirrors the collect DTO of the backend, bound by bound. */
export const MAX_QR_PAYLOAD_LENGTH = 512;
export const MAX_PARTNER_REFERENCE_LENGTH = 64;
export const MAX_PAYMENT_AMOUNT = 9_999_999_999.99;

export const shortCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(SHORT_CODE_LENGTH);

export const paymentAmountSchema = z
  .number()
  .positive()
  .max(MAX_PAYMENT_AMOUNT)
  .multipleOf(0.01);

/**
 * Exactly one credential, never both: the till either scanned the QR or typed
 * the code read aloud, and the backend refuses a request carrying the two.
 */
export const collectPaymentSchema = z
  .object({
    qrPayload: z.string().max(MAX_QR_PAYLOAD_LENGTH).optional(),
    shortCode: shortCodeSchema.optional(),
    amount: paymentAmountSchema,
    partnerReference: z
      .string()
      .trim()
      .min(1)
      .max(MAX_PARTNER_REFERENCE_LENGTH)
      .optional(),
  })
  .refine(
    ({ qrPayload, shortCode }) => Boolean(qrPayload) !== Boolean(shortCode),
    { message: 'ONE_CREDENTIAL_REQUIRED', path: ['shortCode'] },
  );

export const paymentReceiptSchema = z.object({
  paymentId: z.uuid(),
  amount: z.string(),
  partnerReference: z.string().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
});

export type CollectPayment = z.infer<typeof collectPaymentSchema>;
export type PaymentReceipt = z.infer<typeof paymentReceiptSchema>;
