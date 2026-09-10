import { z } from 'zod';

import { PRO_CONTENT } from '@/content/pro';
import { POSTAL_CODE_FORMAT } from '@/lib/address';

const { fields } = PRO_CONTENT.account.form;

/** What a partner may change about its establishment; the examined identity stays out of reach. */
export const profileFormSchema = z.object({
  tradeName: z.string().trim().min(1, fields.tradeName.required),
  addressLine: z.string().trim().min(1, fields.addressLine.required),
  postalCode: z
    .string()
    .trim()
    .regex(POSTAL_CODE_FORMAT, fields.postalCode.format),
  city: z.string().trim().min(1, fields.city.required),
  categories: z.array(z.string()).min(1, fields.categories.required),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
