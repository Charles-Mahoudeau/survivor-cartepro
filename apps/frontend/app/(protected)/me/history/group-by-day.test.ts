import { describe, expect, it } from 'bun:test';

import type { WalletEntry } from '@/lib/api/schemas/backend/wallet-entry';

import { groupByDay } from './group-by-day';

function entry(id: string, createdAt: string): WalletEntry {
  return {
    id,
    createdAt,
    amount: '10.00',
    direction: 'debit',
    kind: 'payment_sent',
    label: null,
  } as unknown as WalletEntry;
}

describe('groupByDay', () => {
  it('puts the movements of one calendar day under a single heading', () => {
    const groups = groupByDay([
      entry('a', '2026-09-07T20:00:00Z'),
      entry('b', '2026-09-07T08:00:00Z'),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0][1].map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('keeps the order it was given, so the newest day stays first', () => {
    const groups = groupByDay([
      entry('recent', '2026-09-07T09:00:00Z'),
      entry('ancien', '2026-09-05T09:00:00Z'),
    ]);

    expect(groups.map(([, items]) => items[0].id)).toEqual([
      'recent',
      'ancien',
    ]);
  });

  it('splits two movements that share an hour but not a day in Paris', () => {
    const groups = groupByDay([
      entry('apres-minuit', '2026-09-07T22:30:00Z'),
      entry('avant-minuit', '2026-09-07T21:30:00Z'),
    ]);

    expect(groups).toHaveLength(2);
  });

  it('returns nothing for an empty register', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
