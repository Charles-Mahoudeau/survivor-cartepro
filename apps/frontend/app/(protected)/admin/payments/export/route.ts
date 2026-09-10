import { ECODES } from '@/lib/api/clients';
import { exportTransactionsCsv } from '@/lib/api/routes/transaction';
import {
  TRANSACTIONS_CSV_CONTENT_TYPE,
  TRANSACTIONS_CSV_FILENAME,
} from '@/lib/api/schemas/backend/transaction';

const FORBIDDEN_STATUS = 403;
const BAD_GATEWAY_STATUS = 502;

/** Hands the transactions export to the administration, fetched with the session of the request. */
export async function GET(request: Request): Promise<Response> {
  const { data, error } = await exportTransactionsCsv();

  if (error === ECODES.UNAUTHENTICATED || error === ECODES.ACCOUNT_BANNED) {
    return Response.redirect(new URL('/login', request.url));
  }
  if (error === ECODES.FORBIDDEN_ROLE) {
    return new Response(null, { status: FORBIDDEN_STATUS });
  }
  if (error) {
    return new Response(null, { status: BAD_GATEWAY_STATUS });
  }

  return new Response(data, {
    headers: {
      'content-type': TRANSACTIONS_CSV_CONTENT_TYPE,
      'content-disposition': `attachment; filename="${TRANSACTIONS_CSV_FILENAME}"`,
    },
  });
}
