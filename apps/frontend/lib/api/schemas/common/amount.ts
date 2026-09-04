import { z } from 'zod';

/**
 * Amounts travel as decimal strings with at most two decimals — never in
 * cents. The backend serialises its `numeric` columns this way.
 */
export const amountSchema = z.string().regex(/^-?\d+(\.\d{1,2})?$/);

export type Amount = z.infer<typeof amountSchema>;
