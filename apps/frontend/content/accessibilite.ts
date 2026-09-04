/**
 * The accessibility declaration, in one place. The footer mention and the
 * `/accessibilite` page read the same state, so they cannot drift apart.
 *
 * Source: `docs/legal/declaration-accessibilite.md`. Any change here is a
 * change to a legal statement: it follows an audit, never a redesign.
 */

export const ACCESSIBILITE_PATH = '/accessibilite';

/** The three states the RGAA allows, and nothing else. */
export type EtatConformite = 'totalement' | 'partiellement' | 'non';

export const ETAT_CONFORMITE: EtatConformite = 'non';

/** Wording imposed by the RGAA for the home-page mention. */
const MENTIONS: Record<EtatConformite, string> = {
  totalement: 'Accessibilité : totalement conforme',
  partiellement: 'Accessibilité : partiellement conforme',
  non: 'Accessibilité : non conforme',
};

export const MENTION_CONFORMITE = MENTIONS[ETAT_CONFORMITE];

export const ACCESSIBILITE_CONTENT = {
  entite: 'Ministère du Job et Bonheur',
  service: 'Ticket Tout',
  etabliLe: '4 septembre 2026',
  revision: '8320a08',
  contact: 'accessibilite@tickettout.gouv.fr',
  tauxApplicables: '63,6 %',
  criteresConformes: 35,
  criteresApplicables: 55,
  criteresNonConformes: 13,
  criteresNonTestes: 7,
} as const;
