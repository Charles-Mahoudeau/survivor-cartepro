import { TOO_MANY_REQUESTS_STATUS } from './constants';

export type AuthErrorCode =
  | 'INVALID_EMAIL_OR_PASSWORD'
  | 'BANNED_USER'
  | 'INVALID_EMAIL'
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_TOO_LONG'
  | 'USER_ALREADY_EXISTS'
  | 'TOO_MANY_REQUESTS'
  | 'MISCONFIGURED_ORIGIN'
  | 'UNKNOWN_ERROR';

/**
 * Branches on the code, never on the message: the API puts a machine-readable
 * code on the wire, and a message is free to change. The rate limiter is the
 * exception — it answers 429 with a message and no code at all.
 */
export function toAuthError(
  error: { code?: string; status?: number } | null | undefined,
): AuthErrorCode {
  if (error?.status === TOO_MANY_REQUESTS_STATUS) {
    return 'TOO_MANY_REQUESTS';
  }

  switch (error?.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
    case 'BANNED_USER':
    case 'INVALID_EMAIL':
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
      return error.code;
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'USER_ALREADY_EXISTS';
    case 'INVALID_ORIGIN':
    case 'MISSING_OR_NULL_ORIGIN':
      return 'MISCONFIGURED_ORIGIN';
    default:
      return 'UNKNOWN_ERROR';
  }
}

/**
 * A banned account is refused with a sentence written by the API, which is the
 * only side that knows what it refuses. Everything else is worded here.
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Adresse électronique ou mot de passe incorrect.',
  BANNED_USER: 'Ce compte est suspendu.',
  INVALID_EMAIL: 'Cette adresse électronique n’est pas valide.',
  PASSWORD_TOO_SHORT: 'Le mot de passe est trop court.',
  PASSWORD_TOO_LONG: 'Le mot de passe est trop long.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse électronique.',
  TOO_MANY_REQUESTS: 'Trop de tentatives. Réessayez dans une minute.',
  MISCONFIGURED_ORIGIN:
    'La configuration du service d’authentification est incorrecte. Contactez l’administration du dispositif.',
  UNKNOWN_ERROR: 'L’opération a échoué. Réessayez.',
};
