import { z } from 'zod';

import { isValidSiren } from '@/lib/siren';

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

export const partnerLastDecisionSchema = z.object({
  reason: z.string(),
  toStatus: partnerStatusSchema,
  createdAt: z.iso.datetime({ offset: true }),
});

export const partnerProfileSchema = z.object({
  id: z.uuid(),
  legalName: z.string(),
  tradeName: z.string(),
  siren: z.string(),
  businessPurpose: z.string(),
  status: partnerStatusSchema,
  addressLine: z.string(),
  postalCode: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  categories: z.array(partnerCategorySummarySchema),
  lastDecision: partnerLastDecisionSchema.nullable(),
});

export const createPartnerSchema = z.object({
  legalName: z.string().trim().min(1),
  tradeName: z.string().trim().min(1),
  siren: z.string().refine(isValidSiren),
  businessPurpose: z.string().trim().min(1),
  addressLine: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  city: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  categories: z.array(z.string()).min(1),
});

export const updatePartnerProfileSchema = z.object({
  tradeName: z.string().trim().min(1).optional(),
  addressLine: z.string().trim().min(1).optional(),
  postalCode: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  categories: z.array(z.string()).min(1).optional(),
});

export type PartnerCategorySummary = z.infer<
  typeof partnerCategorySummarySchema
>;
export type PartnerStatus = z.infer<typeof partnerStatusSchema>;
export type Partner = z.infer<typeof partnerSchema>;
export type PartnerPage = z.infer<typeof partnerPageSchema>;
export type ListPartnersQuery = z.infer<typeof listPartnersQuerySchema>;
export type PartnerLastDecision = z.infer<typeof partnerLastDecisionSchema>;
export type PartnerProfile = z.infer<typeof partnerProfileSchema>;
export type CreatePartner = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerProfile = z.infer<typeof updatePartnerProfileSchema>;
