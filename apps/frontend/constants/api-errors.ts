import type { ApiErrorCode } from '@/lib/api/helpers/types';

/** What a person reads when a server action fails. One locale, French. */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: 'Votre session a expiré. Reconnectez-vous.',
  ACCOUNT_BANNED:
    'Ce compte est suspendu. Contactez l’administration du dispositif.',
  FORBIDDEN_ROLE: 'Votre profil ne donne pas accès à cette ressource.',
  WALLET_NOT_FOUND: 'Aucun portefeuille n’est rattaché à votre compte.',
  PARTNER_NOT_FOUND: 'Ce partenaire n’existe pas ou n’est plus actif.',
  PARTNER_NOT_PENDING:
    'Cette demande a déjà été instruite. Rechargez la page pour voir la décision.',
  BAD_REQUEST: 'La demande est incorrecte. Rechargez la page et réessayez.',
  INTERNAL_SERVER_ERROR:
    'Le service est momentanément indisponible. Réessayez.',
  VALIDATION_FAILED:
    'La réponse du service est inattendue. Contactez l’administration du dispositif.',
  ERR_API_CONNECTION_REFUSED:
    'Le service ne répond pas. Réessayez dans un instant.',
  ERR_API_FETCH_FAILED: 'La connexion au service a échoué. Réessayez.',
  UNKNOWN_ERROR: 'L’opération a échoué. Réessayez.',
};
