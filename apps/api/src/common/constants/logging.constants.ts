/**
 * What the request log is allowed to say. Product and security decisions,
 * identical on every deployment and meant to go through code review, hence
 * constants rather than environment variables.
 */

/** Stands in for a denylisted value. */
export const REDACTED_PLACEHOLDER = '[redacted]';

/** Stands in for a node the walk refused to descend into. */
export const TRUNCATED_PLACEHOLDER = '[truncated]';

/**
 * How deep the redaction walk goes before giving up on a node. A bound rather
 * than a seen-set: it also terminates a self-referencing object, which a log
 * line has no business rendering anyway.
 */
export const REDACTION_MAX_DEPTH = 6;

/** Longest serialized payload a single log line carries before truncation. */
export const MAX_LOGGED_PAYLOAD_LENGTH = 1000;

/**
 * Keys whose value never reaches the logs, NORMALIZED — lowercased with `_` and
 * `-` stripped, so `access_token`, `accessToken` and `Access-Token` all collapse
 * onto one entry here.
 *
 * Matching is exact on the normalized key, never a substring test: `translation`
 * contains `lat` and `credited` contains `credit`, and blanking them would make
 * the logs useless without anyone noticing.
 *
 * Grouped by what they carry: credentials and session material, the payment QR
 * and its tokens, employee personal data, partner business identity, and
 * monetary values. The QR matters most — it is a self-contained signed payload
 * with a five minute window, so one that reaches the logs is replayable.
 *
 * Identifiers are absent on purpose. They carry no value on their own and they
 * are the only handle left for correlating the two lines of a request once
 * every amount is masked.
 */
export const REDACTED_KEYS: ReadonlySet<string> = new Set([
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
  'nonce',
  'signature',
  'email',
  'phone',
  'phonenumber',
  'firstname',
  'lastname',
  'birthdate',
  'siret',
  'siren',
  'iban',
  'bic',
  'amount',
  'montant',
  'balance',
  'solde',
  'credit',
  'debit',
]);
