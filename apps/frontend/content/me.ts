/** Every label of the employee space, in one greppable place. */
export const ME_CONTENT = {
  brand: 'CartePro',
  roleLabel: 'Salarié·e',
  nav: {
    wallet: 'Mon compte',
    history: 'Historique',
    partners: 'Partenaires',
    pay: 'Payer',
  },
  mobileNav: {
    wallet: 'Compte',
    history: 'Historique',
    partners: 'Partenaires',
    pay: 'Payer',
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
  },
  pay: {
    title: 'Payer',
    subtitle: 'Présentez ce code au commerçant',
    generate: 'Générer un code de paiement',
    regenerate: 'Générer un nouveau code',
    cancel: 'Annuler ce code',
    cancelling: 'Annulation…',
    generating: 'Génération…',
    scanLabel: 'Code à scanner',
    shortCodeLabel: 'Ou dictez ce code',
    expiresIn: 'Expire dans',
    expired: 'Ce code a expiré. Générez-en un nouveau.',
    idle: 'Aucun code actif. Générez-en un au moment de payer.',
    emptyBalance:
      'Votre solde est épuisé. Un code de paiement ne peut pas être généré tant que votre employeur ne vous a pas crédité.',
    noWallet:
      'Aucun portefeuille n’est rattaché à votre compte. Votre employeur doit vous déclarer auprès du dispositif.',
    disabled:
      'Votre portefeuille est désactivé. Contactez votre employeur ou l’administration du dispositif.',
    offlineNote: 'Bon à savoir :',
    offlineNoteBody:
      'Ce code reste valable sans connexion : il porte lui-même sa signature. Le commerçant le vérifie de son côté.',
    singleUse:
      'À usage unique, valable quelques minutes. Générer un nouveau code annule le précédent.',
  },
  error: {
    title: 'Cette page n’a pas pu être affichée.',
    body: 'Une erreur est survenue en chargeant vos données. Vous pouvez réessayer.',
    retry: 'Réessayer',
  },
} as const;
