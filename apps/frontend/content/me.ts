/** Every label of the employee space, in one greppable place. */
export const ME_CONTENT = {
  brand: 'CartePro',
  roleLabel: 'Salarié·e',
  nav: {
    wallet: 'Mon compte',
    history: 'Historique',
    partners: 'Partenaires',
  },
  mobileNav: {
    wallet: 'Compte',
    history: 'Historique',
    partners: 'Partenaires',
  },
  signOut: 'Se déconnecter',
  signOutShort: 'Déconnexion',
  simulation: '(simulation)',
  wallet: {
    title: 'Mon portefeuille',
    subtitle: 'Vos avantages CartePro',
    balance: 'Solde disponible',
    updatedAt: 'Mis à jour le',
    findPartner: 'Partenaires',
    recentMovements: 'Derniers mouvements',
    seeAll: 'Tout voir',
    noMovement: 'Aucun mouvement pour le moment.',
    noWallet:
      'Aucun portefeuille n’est encore rattaché à votre compte. Votre employeur doit vous déclarer auprès du dispositif.',
    disabled:
      'Votre portefeuille est désactivé. Contactez votre employeur ou l’administration du dispositif.',
    note: 'Note :',
    noteBody:
      'Votre employeur crédite votre portefeuille CartePro. Les montants affichés sont des simulations sans valeur monétaire réelle.',
  },
  history: {
    title: 'Historique',
    subtitle: 'Tous vos mouvements, du plus récent au plus ancien',
    loadMore: 'Charger plus',
    loading: 'Chargement…',
    empty: 'Aucun mouvement pour le moment.',
    credit: 'Crédit',
    debit: 'Paiement',
    allocation: 'Abondement employeur',
    allocationShort: 'Abondement',
    refund: 'Remboursement',
    unknownPartner: 'Partenaire',
  },
  partners: {
    title: 'Partenaires',
    subtitle: 'Établissements acceptant CartePro',
    searchPlaceholder: 'Rechercher un commerce, une ville…',
    searchLabel: 'Rechercher un partenaire',
    allCategories: 'Tous',
    empty: 'Aucun partenaire trouvé',
    loadMore: 'Charger plus',
    loading: 'Chargement…',
    results: (count: number) =>
      count === 1 ? '1 partenaire' : `${count} partenaires`,
  },
  error: {
    title: 'Cette page n’a pas pu être affichée.',
    body: 'Une erreur est survenue en chargeant vos données. Vous pouvez réessayer.',
    retry: 'Réessayer',
  },
} as const;
