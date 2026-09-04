import { PaymentStatus } from '@/modules/payments/core/enums/payment-status.enum';
import type { TransactionRow } from '../../../repos/transaction.repo';
import { toTransactionsCsv } from '../csv.helper';

const HEADER = 'id;date_iso8601;employee_id;partner_id;amount_cents;status';

function row(overrides: Partial<TransactionRow> = {}): TransactionRow {
  return {
    id: '01a06b7c-14f1-7de6-9a6c-39de1891031d',
    createdAt: new Date('2026-09-02T14:20:00.000Z'),
    employeeId: '01a06b7c-14d7-7eea-9aee-c780e5c03b31',
    partnerId: '01a06b7c-14e2-7bd4-8f13-7a2c0f6d9e21',
    amount: '12.50',
    status: PaymentStatus.VALIDATED,
    ...overrides,
  };
}

describe('toTransactionsCsv', () => {
  it('writes the header alone, newline-terminated, when there is nothing to export', () => {
    expect(toTransactionsCsv([])).toBe(`${HEADER}\n`);
  });

  it('writes the six columns in the order the reader expects', () => {
    expect(toTransactionsCsv([row()])).toBe(
      `${HEADER}\n` +
        '01a06b7c-14f1-7de6-9a6c-39de1891031d;2026-09-02T14:20:00.000Z;' +
        '01a06b7c-14d7-7eea-9aee-c780e5c03b31;01a06b7c-14e2-7bd4-8f13-7a2c0f6d9e21;' +
        '1250;validated\n',
    );
  });

  it('keeps the rows in the order it was given', () => {
    const csv = toTransactionsCsv([
      row({ id: 'first' }),
      row({ id: 'second' }),
      row({ id: 'third' }),
    ]);

    expect(
      csv
        .split('\n')
        .slice(1, 4)
        .map((line) => line.split(';')[0]),
    ).toEqual(['first', 'second', 'third']);
  });

  it('converts a decimal amount to integer cents without float drift', () => {
    const cents = (amount: string) =>
      toTransactionsCsv([row({ amount })])
        .split('\n')[1]
        .split(';')[4];

    expect(cents('26.40')).toBe('2640');
    expect(cents('0.10')).toBe('10');
    expect(cents('1.15')).toBe('115');
    expect(cents('4.35')).toBe('435');
    expect(cents('150.00')).toBe('15000');
    expect(cents('9999999999.99')).toBe('999999999999');
  });

  it('writes the date as an ISO 8601 instant in UTC', () => {
    const csv = toTransactionsCsv([
      row({ createdAt: new Date('2026-06-06T07:05:09.123+02:00') }),
    ]);

    expect(csv.split('\n')[1].split(';')[1]).toBe('2026-06-06T05:05:09.123Z');
  });

  it('carries a refusal as its own status, not as a missing line', () => {
    const csv = toTransactionsCsv([row({ status: PaymentStatus.REFUSED })]);

    expect(csv.split('\n')[1].split(';')[5]).toBe('refused');
  });
});
