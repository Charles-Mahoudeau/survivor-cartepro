import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

/** Labels shared by every space: brand, header, footer, notices. */
export const SITE_CONTENT = {
  title: 'Ticket Tout (simulation)',
  description:
    'Vos avantages salariés, à dépenser partout chez les partenaires du Ministère du Job et Bonheur. Dispositif de simulation, sans valeur monétaire réelle.',
  brandTop: createElement(
    Fragment,
    null,
    'République',
    createElement('br'),
    'Française',
  ) as ReactNode,
  serviceTitle: 'Ticket Tout',
  serviceTagline:
    'Avantages salariés du Ministère du Job et Bonheur — simulation',
  homeTitle: 'Accueil — Ticket Tout',
  skipToContent: 'Contenu',
  signIn: 'Se connecter',
  signOut: 'Se déconnecter',
  menu: 'Menu',
  close: 'Fermer',
  simulation: {
    title: 'Simulation.',
    description:
      'Tous les montants affichés dans cette application sont fictifs. Aucune somme réelle n’est détenue, transférée ni encaissée.',
  },
  footerDescription:
    'Ticket Tout est un dispositif d’avantages salariés dématérialisés simulé pour le Ministère du Job et Bonheur. Aucune valeur monétaire réelle ne circule.',
  footerSimulation: 'Dispositif de simulation',
} as const;
