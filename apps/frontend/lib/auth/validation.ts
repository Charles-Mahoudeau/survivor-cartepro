import { MIN_PASSWORD_LENGTH } from './constants';

/** One message per field name, absent when the field is valid. */
export type FieldErrors = Partial<Record<string, string>>;

/**
 * Deliberately permissive: the authority on an address is the API, which will
 * refuse what it cannot use. This only catches what is obviously not an
 * address, so the browser's own bubble can stay switched off.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Messages say what is wrong and how to fix it, rather than naming a rule.
 * "Saisissez une adresse valide" leaves the reader guessing; an example does not.
 */
export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Saisissez votre adresse électronique.';
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Saisissez une adresse électronique valide, par exemple vous@exemple.fr.';
  }

  return undefined;
}

export function validateName(value: string): string | undefined {
  return value.trim() ? undefined : 'Saisissez votre nom et votre prénom.';
}

/** On sign-in the length is not checked: only the API knows what was set. */
export function validatePassword(
  value: string,
  { enforceLength }: { enforceLength: boolean },
): string | undefined {
  if (!value) {
    return 'Saisissez votre mot de passe.';
  }

  if (enforceLength && value.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }

  return undefined;
}

/** Drops the entries with no message, so an empty object means "valid". */
export function collectErrors(candidates: FieldErrors): FieldErrors {
  return Object.fromEntries(
    Object.entries(candidates).filter(([, message]) => message !== undefined),
  );
}

/**
 * Moves the caret to the first field at fault, in the order the form shows
 * them, so a keyboard or screen-reader user lands on what to correct.
 */
export function focusFirstError(order: string[], errors: FieldErrors): void {
  const first = order.find((name) => errors[name]);
  if (first) {
    document.getElementById(first)?.focus();
  }
}
