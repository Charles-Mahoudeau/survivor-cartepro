import { z } from 'zod';

export const partnerCategorySchema = z.object({
  slug: z.string(),
  displayName: z.string(),
  partnerCount: z.number().int(),
});

export type PartnerCategory = z.infer<typeof partnerCategorySchema>;
