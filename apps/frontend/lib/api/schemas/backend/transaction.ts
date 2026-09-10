import { z } from 'zod';

/** The file name the backend serves the export under. */
export const TRANSACTIONS_CSV_FILENAME = 'transactions.csv';

/** The media type of the export. */
export const TRANSACTIONS_CSV_CONTENT_TYPE = 'text/csv; charset=utf-8';

export const transactionsCsvSchema = z.string();
