/**
 * What the request log is allowed to say. Product/security decisions, identical
 * on every deployment and meant to go through code review — hence constants,
 * not env.
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
 * and `latency` contain `lat`, and blanking them would make the logs useless
 * without anyone noticing.
 *
 * NOT listed, deliberately: identifiers (`id`, `transactionId`, `partnerId`,
 * `employeeId`). They carry no value on their own and they are the only handle
 * left for correlating the two lines of a request once every amount is masked.
 * Removing them too would leave a log that says nothing at all.
 */
export const REDACTED_KEYS: ReadonlySet<string> = new Set([
  // Credentials and session material.
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
  // The payment QR. The brief requires it to work "en mode dégradé (connexion
  // limitée)", which means a self-contained signed payload rather than an id
  // resolved against the database — so it is a bearer credential with a five
  // minute window. A QR that reaches the logs is replayable inside that window,
  // which is the whole reason this block exists.
  'qrcode',
  'qrtoken',
  'qrpayload',
  'paymenttoken',
  'nonce',
  'signature',
  // Employee personal data.
  'email',
  'phone',
  'phonenumber',
  'firstname',
  'lastname',
  'birthdate',
  // Partner / employer business identity.
  'siret',
  'siren',
  'iban',
  'bic',
  // Monetary values. Masked by explicit project decision: nothing about an
  // amount or a balance needs to survive in a log file. The cost is real and
  // was accepted — tracing a balance bug from the logs alone is no longer
  // possible, and doing it means reading the database instead.
  'amount',
  'montant',
  'balance',
  'solde',
  'credit',
  'debit',
]);
