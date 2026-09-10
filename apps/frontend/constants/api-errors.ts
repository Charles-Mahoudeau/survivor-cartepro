import type { ApiErrorCode } from '@/lib/api/helpers/types';

/** What a person reads when a server action fails. One locale, French. */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: 'Votre session a expiré. Reconnectez-vous.',
  ACCOUNT_BANNED:
    'Ce compte est suspendu. Contactez l’administration du dispositif.',
  FORBIDDEN_ROLE: 'Votre profil ne donne pas accès à cette ressource.',
  WALLET_NOT_FOUND: 'Aucun portefeuille n’est rattaché à votre compte.',
  PARTNER_NOT_FOUND: 'Ce partenaire n’existe pas ou n’est plus actif.',
  PARTNER_NOT_ACTIVE:
    'Votre établissement n’est pas encore actif. L’administration doit valider votre demande.',
  INSUFFICIENT_BALANCE:
    'Le solde du salarié ne couvre pas ce montant. Le code reste valable pour un montant plus petit.',
  PAYMENT_TOKEN_INVALID: 'Ce code est invalide. Demandez-en un nouveau.',
  PAYMENT_TOKEN_LOOKUP_INVALID:
    'Ce code est invalide. Vérifiez la saisie, ou demandez-en un nouveau.',
  PAYMENT_TOKEN_EXPIRED:
    'Ce code a expiré. Demandez au salarié d’en générer un nouveau.',
  PAYMENT_TOKEN_REVOKED:
    'Ce code a été annulé par le salarié. Demandez-en un nouveau.',
  PAYMENT_TOKEN_ALREADY_USED:
    'Ce code a déjà servi à un paiement. Un code ne vaut qu’une fois.',
  PARTNER_NOT_PENDING:
    'Cette demande a déjà été traitée. Rechargez la page pour voir la décision.',
  PAYMENT_TOKEN_NOT_FOUND: 'Aucun code de paiement n’est actif. Générez-en un.',
  EMPTY_BALANCE:
    'Votre solde est épuisé. Un code de paiement ne peut pas être généré.',
  PARTNER_ALREADY_EXISTS:
    'Ce compte porte déjà un dossier d’établissement. Retrouvez-le dans votre espace partenaire.',
  PARTNER_SIREN_ALREADY_REGISTERED:
    'Ce SIREN est déjà rattaché à un dossier. Un établissement n’est référencé qu’une fois.',
  PARTNER_CATEGORY_NOT_FOUND:
    'Une des catégories choisies n’existe plus. Rechargez la page et choisissez-en une autre.',
  BAD_REQUEST: 'La demande est incorrecte. Rechargez la page et réessayez.',
  INTERNAL_SERVER_ERROR:
    'Le service est momentanément indisponible. Réessayez.',
  VALIDATION_FAILED:
    'La réponse du service est inattendue. Contactez l’administration du dispositif.',
  ERR_API_CONNECTION_REFUSED:
    'Le service ne répond pas. Réessayez dans un instant.',
  ERR_API_FETCH_FAILED: 'La connexion au service a échoué. Réessayez.',
  ADDRESS_NOT_FOUND:
    'Adresse introuvable. Vérifiez le numéro, la voie et le code postal.',
  GEOCODING_UNAVAILABLE:
    'La vérification de l’adresse est momentanément indisponible. Réessayez dans un instant.',
  UNKNOWN_ERROR: 'L’opération a échoué. Réessayez.',
};
