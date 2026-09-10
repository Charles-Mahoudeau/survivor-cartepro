/** Every label of the partner space, in one greppable place. */
export const PRO_CONTENT = {
  roleLabel: 'Espace partenaire',
  nav: {
    group: 'Établissement',
    overview: 'Tableau de bord',
    collect: 'Encaisser',
    partners: 'Catalogue',
    account: 'Mon établissement',
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
  account: {
    title: 'Mon établissement',
    subtitle:
      'Votre demande de référencement, la décision de l’administration et les informations affichées aux salariés.',
    trail: 'Mon établissement',
    status: {
      title: 'Référencement',
      labels: {
        pending: 'En attente d’examen',
        active: 'Référencé',
        refused: 'Refusé',
        banned: 'Suspendu',
      },
      explanations: {
        pending:
          'Un agent examine votre demande. Vous pourrez encaisser dès qu’elle sera acceptée.',
        active:
          'Votre établissement apparaît dans le catalogue et peut encaisser.',
        refused:
          'Votre demande a été refusée. Le motif de la décision figure ci-dessous.',
        banned:
          'Votre établissement est suspendu : il n’apparaît plus dans le catalogue et ne peut plus encaisser.',
      },
      decision: 'Décision du',
    },
    identity: {
      title: 'Identité de l’entreprise',
      legalName: 'Raison sociale',
      siren: 'SIREN',
      businessPurpose: 'Objet social',
      locked:
        'Ces informations ont été examinées par l’administration : elles ne se modifient pas ici.',
    },
    form: {
      title: 'Informations affichées aux salariés',
      fields: {
        tradeName: { label: 'Enseigne', required: 'Saisissez l’enseigne.' },
        addressLine: { label: 'Adresse', required: 'Saisissez l’adresse.' },
        postalCode: {
          label: 'Code postal',
          format: 'Le code postal compte cinq chiffres.',
        },
        city: { label: 'Ville', required: 'Saisissez la ville.' },
        categories: {
          label: 'Catégories',
          hint: 'Une ou plusieurs, selon ce que vous vendez.',
          required: 'Choisissez au moins une catégorie.',
        },
      },
      submit: 'Enregistrer',
      submitting: 'Enregistrement…',
      saved: 'Informations enregistrées.',
      failed: 'L’enregistrement a échoué. Réessayez.',
    },
  },
  error: {
    title: 'Cette page n’a pas pu être affichée.',
    body: 'Une erreur est survenue en chargeant vos données. Vous pouvez réessayer.',
    retry: 'Réessayer',
  },
} as const;
