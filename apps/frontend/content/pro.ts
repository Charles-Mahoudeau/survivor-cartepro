/** Every label of the partner space, in one greppable place. */
export const PRO_CONTENT = {
  roleLabel: 'Espace partenaire',
  nav: {
    group: 'Établissement',
    overview: 'Tableau de bord',
    collect: 'Encaisser',
    partners: 'Catalogue',
  },
  collect: {
    title: 'Encaisser un paiement',
    subtitle:
      'Saisissez le code que le salarié vous présente, puis le montant à débiter.',
    trail: 'Encaisser',
    codeLabel: 'Code du salarié',
    codeHelp: 'Huit caractères, lus sur son écran ou dictés au comptoir.',
    codePlaceholder: 'ABCD2345',
    amountLabel: 'Montant à débiter',
    amountHelp: 'En euros, deux décimales au maximum.',
    referenceLabel: 'Référence interne',
    referenceOptional: 'facultative',
    referenceHelp: 'Votre numéro de ticket ou de caisse, si vous en avez un.',
    referencePlaceholder: 'TICKET-042',
    submit: 'Encaisser',
    submitting: 'Encaissement…',
    reset: 'Nouvel encaissement',
    codeRequired: 'Saisissez le code du salarié.',
    amountRequired: 'Saisissez un montant supérieur à zéro.',
    receipt: {
      title: 'Paiement encaissé',
      amount: 'Montant débité',
      reference: 'Référence',
      identifier: 'Identifiant du paiement',
      at: 'Encaissé le',
      note: 'Ce paiement est définitif. Une correction se fait par une écriture inverse, jamais en modifiant celle-ci.',
    },
    notActive: {
      title: 'Établissement pas encore actif',
      body: 'Votre demande d’inscription doit être acceptée par l’administration avant de pouvoir encaisser.',
    },
  },
  partners: {
    title: 'Catalogue des partenaires',
    subtitle: 'Les établissements référencés CartePro, le vôtre compris.',
    trail: 'Catalogue',
  },
  error: {
    title: 'Cette page n’a pas pu être affichée.',
    body: 'Une erreur est survenue en chargeant vos données. Vous pouvez réessayer.',
    retry: 'Réessayer',
  },
} as const;
