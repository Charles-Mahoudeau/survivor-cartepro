import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from './pagination.constants';
import type { CursorPage } from './pagination.types';

const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURSOR_PATTERN = /^[A-Za-z0-9_-]+$/;

export class InvalidCursorError extends Error {
  constructor() {
    super('Invalid pagination cursor');
    this.name = InvalidCursorError.name;
  }
}

export function encodeCursor(id: string): string {
  if (!UUID_V7_PATTERN.test(id)) {
    throw new InvalidCursorError();
  }

  return Buffer.from(id, 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): string {
  if (!CURSOR_PATTERN.test(cursor)) {
    throw new InvalidCursorError();
  }

  const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
  if (!UUID_V7_PATTERN.test(decoded) || encodeCursor(decoded) !== cursor) {
    throw new InvalidCursorError();
  }

  return decoded;
}

export function paginate<T extends { id: string }>(
  rows: readonly T[],
  limit = DEFAULT_PAGE_LIMIT,
): CursorPage<T> {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    throw new RangeError('Invalid pagination limit');
  }

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const lastItem = items.at(-1);

  return {
    items,
    nextCursor: hasMore && lastItem ? encodeCursor(lastItem.id) : null,
    hasMore,
  };
}
