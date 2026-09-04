import type { TransactionRow } from '../../repos/transaction.repo';

/**
 * The contract of the reader on the other side: these names, in this order.
 * A column added here is a column its script has to learn about.
 */
export const TRANSACTIONS_CSV_COLUMNS = [
  'id',
  'date_iso8601',
  'employee_id',
  'partner_id',
  'amount_cents',
  'status',
] as const;

export const CSV_SEPARATOR = ';';
export const CSV_LINE_BREAK = '\n';

const CENTS_PER_EURO = 100;

/**
 * Serialises transactions, one per line, header first, newline-terminated.
 *
 * No field is ever quoted: every value is a UUID, an ISO 8601 instant, an
 * integer or an enum member, none of which can contain the separator.
 */
export function toTransactionsCsv(rows: readonly TransactionRow[]): string {
  const lines = rows.map((row) =>
    [
      row.id,
      row.createdAt.toISOString(),
      row.employeeId,
      row.partnerId,
      String(Math.round(Number(row.amount) * CENTS_PER_EURO)),
      row.status,
    ].join(CSV_SEPARATOR),
  );

  return (
    [TRANSACTIONS_CSV_COLUMNS.join(CSV_SEPARATOR), ...lines].join(
      CSV_LINE_BREAK,
    ) + CSV_LINE_BREAK
  );
}
