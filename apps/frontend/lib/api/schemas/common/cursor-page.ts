import { z } from 'zod';

/** Mirrors `PaginationQueryDto` and `paginate()` of the backend. */
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(MAX_PAGE_LIMIT).optional(),
});

export function cursorPageSchema<Item extends z.ZodType>(item: Item) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  });
}

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export interface CursorPage<Item> {
  items: Item[];
  nextCursor: string | null;
  hasMore: boolean;
}
