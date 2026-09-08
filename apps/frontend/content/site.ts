/** Labels shared by every space: brand, header, footer, notices. */
export const SITE_CONTENT = {
  brand: 'CartePro',
  title: 'CartePro (simulation)',
  description:
    'Vos avantages salariés, à dépenser partout chez les partenaires du dispositif. Démonstrateur technique, sans valeur monétaire réelle.',
  serviceTitle: 'CartePro',
  serviceTagline: 'Avantages salariés dématérialisés — simulation',
  homeTitle: 'Accueil — CartePro',
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
  /** Wording fixed by the cabinet: it is reproduced verbatim, never reworded. */
  disclaimer:
    'Démonstrateur technique, ne constitue pas un service public en exploitation.',
  offline: {
    pageTitle: 'Hors ligne — CartePro',
    title: 'Vous êtes hors ligne',
    subtitle: 'Cette page a besoin du réseau pour s’afficher.',
    description: 'Reconnectez-vous à Internet, puis réessayez.',
    retry: 'Réessayer',
  },
  install: {
    title: 'Installer CartePro',
    description:
      'Posez l’application sur votre écran d’accueil pour l’ouvrir d’un geste, en plein écran.',
    action: 'Installer',
    iosDescription:
      'Dans Safari, touchez le bouton Partager, puis « Sur l’écran d’accueil ».',
    dismiss: 'Plus tard',
  },
  footerDescription:
    'CartePro est un dispositif d’avantages salariés dématérialisés. Aucune valeur monétaire réelle ne circule.',
} as const;
