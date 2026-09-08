/** Payload format version. Bump when the claims shape changes; old tokens then fail closed. */
export const CURRENT_PAYMENT_TOKEN_VERSION = 1;

/** Hard ceiling on QR lifetime, independent of the configured PAYMENT_TOKEN_TTL_SECONDS. */
export const MAX_PAYMENT_TOKEN_TTL_SECONDS = 300;

export const SHORT_CODE_LENGTH = 8;

/** Alphanumeric, uppercase — matches what a partner types at the counter. */
export const SHORT_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Bounds the retry loop on a uniqueness collision among live tokens. */
export const SHORT_CODE_MAX_ATTEMPTS = 5;
