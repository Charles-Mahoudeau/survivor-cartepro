/** `payment.amount` is numeric(12, 2), so ten digits sit before the point. */
export const MAX_PAYMENT_AMOUNT = 9_999_999_999.99;

/** Longest till reference a partner may attach to a payment. */
export const MAX_PARTNER_REFERENCE_LENGTH = 64;

/**
 * Bounds a malformed scan. A real payload is base64url claims plus a base64url
 * HMAC, well under this; the cap is what keeps an unbounded body out of the
 * signature check.
 */
export const MAX_QR_PAYLOAD_LENGTH = 512;
