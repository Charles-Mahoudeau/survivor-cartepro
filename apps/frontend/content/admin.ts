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
      'Chaque décision est motivée, horodatée et conservée. Elle ne peut pas être reprise.',
    empty: 'Aucune demande dans cet état.',
    loadMore: 'Charger plus',
    loading: 'Chargement…',
    filedOn: 'Déposée le',
    siren: 'SIREN',
    review: 'Instruire',
    status: {
      pending: 'À instruire',
      active: 'Acceptée',
      refused: 'Refusée',
      banned: 'Suspendue',
    },
    filter: {
      label: 'Filtrer par état',
      pending: 'À instruire',
      active: 'Acceptées',
      refused: 'Refusées',
    },
  },
  application: {
    trail: 'Instruction',
    back: 'Retour aux demandes',
    legalName: 'Raison sociale',
    tradeName: 'Enseigne',
    siren: 'SIREN',
    businessPurpose: 'Objet social',
    address: 'Adresse',
    categories: 'Catégories',
    owner: 'Compte demandeur',
    filedOn: 'Déposée le',
    decidedOn: 'Instruite le',
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
      title: 'Demande déjà instruite',
      body: 'Cette demande a reçu une décision. Une décision ne se reprend pas : elle se corrige par une nouvelle demande.',
    },
  },
} as const;
