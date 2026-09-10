import { z } from 'zod';

import { amountSchema } from '../common/amount';
import { cursorPageSchema, paginationQuerySchema } from '../common/cursor-page';

export const allocationStatusSchema = z.enum(['draft', 'applied']);

/** Why a wallet of the employer is skipped when the allocation is applied. */
export const allocationExclusionReasonSchema = z.enum(['wallet_disabled']);

export const MAX_ALLOCATION_LABEL_LENGTH = 120;
export const MAX_ALLOCATION_AMOUNT = 9_999_999_999.99;

export const allocationSchema = z.object({
  id: z.uuid(),
  employerId: z.uuid(),
  employerName: z.string(),
  label: z.string(),
  amount: amountSchema,
  status: allocationStatusSchema,
  appliedAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
});

export const allocationBeneficiarySchema = z.object({
  walletId: z.uuid(),
  employeeRef: z.string().nullable(),
  holderName: z.string(),
});

export const allocationExcludedSchema = allocationBeneficiarySchema.extend({
  reason: allocationExclusionReasonSchema,
});

export const allocationDetailSchema = allocationSchema.extend({
  beneficiaries: z.array(allocationBeneficiarySchema),
  excluded: z.array(allocationExcludedSchema),
  total: amountSchema,
});

export const allocationAppliedSchema = z.object({
  id: z.uuid(),
  status: allocationStatusSchema,
  appliedAt: z.iso.datetime({ offset: true }),
  creditedCount: z.number().int().nonnegative(),
  total: amountSchema,
  excluded: z.array(allocationExcludedSchema),
});

export const allocationPageSchema = cursorPageSchema(allocationSchema);

export const listAllocationsQuerySchema = paginationQuerySchema.extend({
  status: allocationStatusSchema.optional(),
});

export const createAllocationSchema = z.object({
  employerId: z.uuid(),
  label: z.string().trim().min(1).max(MAX_ALLOCATION_LABEL_LENGTH),
  amount: z.number().positive().max(MAX_ALLOCATION_AMOUNT).multipleOf(0.01),
});

export type AllocationStatus = z.infer<typeof allocationStatusSchema>;
export type AllocationExclusionReason = z.infer<
  typeof allocationExclusionReasonSchema
>;
export type Allocation = z.infer<typeof allocationSchema>;
export type AllocationDetail = z.infer<typeof allocationDetailSchema>;
export type AllocationApplied = z.infer<typeof allocationAppliedSchema>;
export type AllocationPage = z.infer<typeof allocationPageSchema>;
export type CreateAllocation = z.infer<typeof createAllocationSchema>;
