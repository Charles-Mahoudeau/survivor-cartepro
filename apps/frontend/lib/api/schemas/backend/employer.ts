import { z } from 'zod';

import { cursorPageSchema, paginationQuerySchema } from '../common/cursor-page';

export const employerSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  siren: z.string(),
  activeWalletCount: z.number().int().nonnegative(),
  createdAt: z.iso.datetime({ offset: true }),
});

export const employerPageSchema = cursorPageSchema(employerSchema);
export const listEmployersQuerySchema = paginationQuerySchema;

export type Employer = z.infer<typeof employerSchema>;
export type EmployerPage = z.infer<typeof employerPageSchema>;
