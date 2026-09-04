import { MIN_PASSWORD_LENGTH } from './constants';

export type FieldErrors = Partial<Record<string, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function collectErrors(candidates: FieldErrors): FieldErrors {
  return Object.fromEntries(
    Object.entries(candidates).filter(([, message]) => message !== undefined),
  );
}

export function focusFirstError(order: string[], errors: FieldErrors): void {
  const first = order.find((name) => errors[name]);
  if (first) {
    document.getElementById(first)?.focus();
  }
}
