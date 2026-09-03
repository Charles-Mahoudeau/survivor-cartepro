import { describe, expect, it } from '@jest/globals';
import {
  decodeCursor,
  encodeCursor,
  InvalidCursorError,
  paginate,
} from './pagination.helper';

const FIRST_ID = '0190f5c0-0000-7000-8000-000000000001';
const SECOND_ID = '0190f5c0-0000-7000-8000-000000000002';

describe('pagination helper', () => {
  it('round-trips a UUIDv7 cursor', () => {
    expect(decodeCursor(encodeCursor(FIRST_ID))).toBe(FIRST_ID);
  });

  it('rejects malformed and non-UUIDv7 cursors', () => {
    expect(() => decodeCursor('not-a-cursor')).toThrow(InvalidCursorError);
    expect(() => encodeCursor('0190f5c0-0000-4000-8000-000000000001')).toThrow(
      InvalidCursorError,
    );
  });

  it('returns the default-sized page when the input is shorter', () => {
    const page = paginate([{ id: FIRST_ID }]);

    expect(page).toEqual({
      items: [{ id: FIRST_ID }],
      nextCursor: null,
      hasMore: false,
    });
  });

  it('uses limit plus one to signal another page', () => {
    const page = paginate([{ id: FIRST_ID }, { id: SECOND_ID }], 1);

    expect(page.items).toEqual([{ id: FIRST_ID }]);
    expect(page.nextCursor).toBe(encodeCursor(FIRST_ID));
    expect(page.hasMore).toBe(true);
  });

  it('rejects limits outside the shared bounds', () => {
    expect(() => paginate([], 0)).toThrow(RangeError);
    expect(() => paginate([], 101)).toThrow(RangeError);
    expect(() => paginate([], 1.5)).toThrow(RangeError);
  });
});
