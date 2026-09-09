/** Every label of the administration space, in one greppable place. */
export const ADMIN_CONTENT = {
  roleLabel: 'Administration',
  nav: {
    group: 'Pilotage',
    overview: 'Tableau de bord',
    applications: 'Demandes partenaires',
  },
  applications: {
    title: 'Demandes d’inscription',
    subtitle:
      'Chaque demande est examinée par un agent. La décision est motivée, horodatée et conservée : elle ne peut pas être reprise.',
    empty: 'Aucune demande dans cet état.',
    loadMore: 'Charger plus',
    loading: 'Chargement…',
    filedOn: 'Déposée le',
    siren: 'SIREN',
    review: 'Examiner',
    viewDecision: 'Voir la décision',
    status: {
      pending: 'En attente',
      active: 'Acceptée',
      refused: 'Refusée',
      banned: 'Suspendue',
    },
    filter: {
      label: 'Filtrer par état',
      pending: 'En attente',
      active: 'Acceptées',
      refused: 'Refusées',
    },
  },
  application: {
    trail: 'Demande',
    back: 'Retour aux demandes',
    legalName: 'Raison sociale',
    tradeName: 'Enseigne',
    siren: 'SIREN',
    businessPurpose: 'Objet social',
    address: 'Adresse',
    categories: 'Catégories',
    owner: 'Compte demandeur',
    filedOn: 'Déposée le',
    decidedOn: 'Décidée le',
    decision: {
      title: 'Décision',
      help: 'Le motif est conservé et opposable. Il est communiqué au partenaire.',
      reasonLabel: 'Motif de la décision',
      reasonPlaceholder:
        'SIREN vérifié, objet social conforme à la catégorie déclarée…',
      approve: 'Accepter',
      refuse: 'Refuser',
      submitting: 'Enregistrement…',
      approved: 'Demande acceptée. Le partenaire est actif.',
      refused: 'Demande refusée. Le motif a été enregistré.',
      reasonRequired:
        'Un motif est obligatoire, y compris pour une acceptation.',
    },
    settled: {
      title: 'Demande déjà traitée',
      body: 'Cette demande a reçu une décision. Une décision ne se reprend pas : elle se corrige par une nouvelle demande.',
    },
  },
} as const;
