/** A French postal code has five digits. */
export const POSTAL_CODE_LENGTH = 5;

/** Exactly five digits. */
export const POSTAL_CODE_FORMAT = new RegExp(`^\\d{${POSTAL_CODE_LENGTH}}$`);
