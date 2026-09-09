/**
 * Keys the audit log blanks out of a recorded payload, NORMALIZED the same way
 * the logging denylist is — lowercased with `_` and `-` stripped.
 *
 * Deliberately narrower than the one the request log uses. That one also hides
 * amounts, names and business identifiers, which is right for a log line and
 * wrong here: an audit entry exists to prove what happened, and one that hides
 * the amount of a transaction proves nothing to the reader it is written for.
 *
 * What stays out is only what a reader could replay or reuse: the signed QR
 * payload and the short code both resolve to a live payment token, and a
 * refused collection leaves its token spendable. The log is append-only, so a
 * secret written here is written for good.
 */
export const AUDIT_REDACTED_KEYS: ReadonlySet<string> = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'authorization',
  'apikey',
  'secret',
  'sessionid',
  'otp',
  'qrcode',
  'qrtoken',
  'qrpayload',
  'paymenttoken',
  'shortcode',
  'nonce',
  'signature',
]);
