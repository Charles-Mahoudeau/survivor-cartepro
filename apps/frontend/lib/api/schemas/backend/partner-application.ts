import { z } from 'zod';

import { cursorPageSchema, paginationQuerySchema } from '../common/cursor-page';
import { partnerCategorySummarySchema, partnerStatusSchema } from './partner';

export const applicationDecisionSchema = z.enum(['approved', 'refused']);

/** The agent must say why: an unexplained refusal is not one that stands. */
export const MAX_DECISION_REASON_LENGTH = 1000;

export const decideApplicationSchema = z.object({
  decision: applicationDecisionSchema,
  reason: z.string().trim().min(1).max(MAX_DECISION_REASON_LENGTH),
});

export const applicationSchema = z.object({
  id: z.uuid(),
  legalName: z.string(),
  tradeName: z.string(),
  siren: z.string(),
  city: z.string(),
  status: partnerStatusSchema,
  createdAt: z.iso.datetime({ offset: true }),
});

export const applicationOwnerSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
});

export const applicationDetailSchema = z.object({
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
  owner: applicationOwnerSchema,
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const applicationPageSchema = cursorPageSchema(applicationSchema);

export const listApplicationsQuerySchema = paginationQuerySchema.extend({
  status: partnerStatusSchema.optional(),
});

export type ApplicationDecision = z.infer<typeof applicationDecisionSchema>;
export type DecideApplication = z.infer<typeof decideApplicationSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationOwner = z.infer<typeof applicationOwnerSchema>;
export type ApplicationDetail = z.infer<typeof applicationDetailSchema>;
export type ApplicationPage = z.infer<typeof applicationPageSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
