import { TOO_MANY_REQUESTS_STATUS } from './constants';

export type SignInErrorCode =
  | 'INVALID_EMAIL_OR_PASSWORD'
  | 'BANNED_USER'
  | 'TOO_MANY_REQUESTS'
  | 'MISCONFIGURED_ORIGIN'
  | 'UNKNOWN_ERROR';

/**
 * Branches on the code, never on the message: the API puts a machine-readable
 * code on the wire, and a message is free to change. The rate limiter is the
 * exception — it answers 429 with a message and no code at all.
 */
export function toSignInError(
  error: { code?: string; status?: number } | null | undefined,
): SignInErrorCode {
  if (error?.status === TOO_MANY_REQUESTS_STATUS) {
    return 'TOO_MANY_REQUESTS';
  }

  switch (error?.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
    case 'BANNED_USER':
      return error.code;
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
export const SIGN_IN_ERROR_MESSAGES: Record<SignInErrorCode, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Adresse électronique ou mot de passe incorrect.',
  BANNED_USER: 'Ce compte est suspendu.',
  TOO_MANY_REQUESTS:
    'Trop de tentatives de connexion. Réessayez dans une minute.',
  MISCONFIGURED_ORIGIN:
    'La configuration du service d’authentification est incorrecte. Contactez l’administration du dispositif.',
  UNKNOWN_ERROR: 'La connexion a échoué. Réessayez.',
};
