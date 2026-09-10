import { z } from 'zod';

import { ROLES } from '@/lib/auth/constants';

/** Accounts shown per page of the administration list. */
export const ACCOUNTS_PAGE_SIZE = 20;

/** The lengths a suspension can be given, in days. */
export const SUSPENSION_DAYS = [7, 30, 90] as const;

/** The longest reason kept with a suspension or a closure. */
export const MAX_ACCOUNT_REASON_LENGTH = 500;

const dateSchema = z
  .union([z.date(), z.string()])
  .transform((value) => new Date(value).toISOString());

const accountReasonSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_ACCOUNT_REASON_LENGTH);

export const accountRoleSchema = z.enum([
  ROLES.EMPLOYEE,
  ROLES.PARTNER,
  ROLES.ADMIN,
]);

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullish(),
  banned: z.boolean().nullish(),
  banReason: z.string().nullish(),
  banExpires: dateSchema.nullish(),
  createdAt: dateSchema,
});

export const accountPageSchema = z.object({
  users: z.array(accountSchema),
  total: z.number().int(),
});

export const listAccountsQuerySchema = z.object({
  search: z.string().max(100).optional(),
  role: accountRoleSchema.optional(),
  page: z.number().int().min(1).optional(),
});

export const accountStatusChangeSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('suspend'),
    userId: z.uuid(),
    reason: accountReasonSchema,
    days: z.literal(SUSPENSION_DAYS),
  }),
  z.object({
    action: z.literal('close'),
    userId: z.uuid(),
    reason: accountReasonSchema,
  }),
  z.object({
    action: z.literal('reactivate'),
    userId: z.uuid(),
  }),
]);

export type AccountRole = z.infer<typeof accountRoleSchema>;
export type Account = z.infer<typeof accountSchema>;
export type AccountPage = z.infer<typeof accountPageSchema>;
export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;
export type AccountStatusChange = z.infer<typeof accountStatusChangeSchema>;
export type SuspensionDays = (typeof SUSPENSION_DAYS)[number];
