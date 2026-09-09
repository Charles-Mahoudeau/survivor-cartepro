import { z } from 'zod';

import { cursorPageSchema, paginationQuerySchema } from '../common/cursor-page';

export const partnerCategorySummarySchema = z.object({
  slug: z.string(),
  displayName: z.string(),
});

/** The states a dossier moves through, from filed to instructed. */
export const partnerStatusSchema = z.enum([
  'pending',
  'active',
  'refused',
  'banned',
]);

export const partnerSchema = z.object({
  id: z.uuid(),
  legalName: z.string(),
  tradeName: z.string(),
  addressLine: z.string(),
  postalCode: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  categories: z.array(partnerCategorySummarySchema),
});

export const partnerPageSchema = cursorPageSchema(partnerSchema);

export const listPartnersQuerySchema = paginationQuerySchema.extend({
  /** Searched in partner names and city. */
  search: z.string().max(100).optional(),
  /** A category slug. */
  category: z.string().max(100).optional(),
});

export type PartnerCategorySummary = z.infer<
  typeof partnerCategorySummarySchema
>;
export type PartnerStatus = z.infer<typeof partnerStatusSchema>;
export type Partner = z.infer<typeof partnerSchema>;
export type PartnerPage = z.infer<typeof partnerPageSchema>;
export type ListPartnersQuery = z.infer<typeof listPartnersQuerySchema>;
