import type { Partner, WalletEntry } from './types';

/**
 * Les quatre premiers partenaires sont ceux nommés par le Ministre dans le
 * cahier des charges v1.1 (JEB/DNI/2026-002, §2.1). Les deux derniers sont les
 * dossiers « en cours de signature » mentionnés au même endroit : ils
 * remplissent la file d'instruction et servent la démonstration du refus motivé
 * exigée par le cabinet juridique.
 */
export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'p1',
    name: 'Poney Dream 78',
    siren: '812456903',
    objet_social:
      "Exploitation d'un centre équestre, enseignement de l'équitation et organisation de séminaires de cohésion en plein air.",
    category: 'Sport & Nature',
    address: 'Chemin des Écuries',
    city: 'Rambouillet',
    status: 'active',
    submitted_at: '2026-08-04T09:10:00Z',
    decisions: [
      {
        id: 'd1',
        from_status: 'pending',
        to_status: 'active',
        reason:
          "SIREN vérifié auprès de l'INSEE. Activité équestre et séminaires de cohésion conformes à la catégorie Sport & Nature. Partenaire retenu pour le lancement.",
        decided_by: 'Jean-Eudes Berlier',
        decided_at: '2026-08-06T10:25:00Z',
      },
    ],
  },
  {
    id: 'p2',
    name: 'KostumParty',
    siren: '504118276',
    objet_social:
      'Vente et location de déguisements, costumes de scène et accessoires de fête.',
    category: 'Culture & Loisirs',
    address: '37 rue Oberkampf',
    city: 'Paris 11e',
    status: 'active',
    submitted_at: '2026-08-05T14:40:00Z',
    decisions: [
      {
        id: 'd2',
        from_status: 'pending',
        to_status: 'active',
        reason:
          'Dossier complet. Boutique physique ouverte six jours sur sept, activité éligible au titre des loisirs. Partenaire retenu pour le lancement.',
        decided_by: 'Jean-Eudes Berlier',
        decided_at: '2026-08-07T11:05:00Z',
      },
    ],
  },
  {
    id: 'p3',
    name: 'Glaces Artisanales Corrèze',
    siren: '893207415',
    objet_social:
      'Fabrication artisanale de crèmes glacées et sorbets, vente en ligne et retrait en atelier.',
    category: 'Alimentation',
    address: '12 avenue de la Gare',
    city: 'Brive-la-Gaillarde',
    status: 'active',
    submitted_at: '2026-08-08T08:30:00Z',
    decisions: [
      {
        id: 'd3',
        from_status: 'pending',
        to_status: 'active',
        reason:
          'Artisan glacier immatriculé à la chambre de métiers. Vente en ligne et retrait sur place, les deux canaux acceptent le paiement Ticket Tout. Partenaire retenu pour le lancement.',
        decided_by: 'Jean-Eudes Berlier',
        decided_at: '2026-08-10T09:50:00Z',
      },
    ],
  },
  {
    id: 'p4',
    name: 'Chapelier Fontaine',
    siren: '417830562',
    objet_social:
      'Fabrication et vente de chapeaux en feutre de laine, réparation et remise en forme.',
    category: 'Mode & Artisanat',
    address: '5 rue des Filatiers',
    city: 'Toulouse',
    status: 'pending',
    submitted_at: '2026-09-01T16:20:00Z',
    decisions: [],
  },
  {
    id: 'p5',
    name: 'Librairie du Vieux Port',
    siren: '639014728',
    objet_social:
      "Commerce de détail de livres neufs et d'occasion, papeterie et organisation de rencontres d'auteurs.",
    category: 'Culture & Loisirs',
    address: '8 quai du Port',
    city: 'Marseille',
    status: 'pending',
    submitted_at: '2026-09-02T10:45:00Z',
    decisions: [],
  },
  {
    id: 'p6',
    name: 'Tabac Presse de la Mairie',
    siren: '725390184',
    objet_social:
      'Débit de tabac, vente de journaux, jeux de hasard et articles de fumeurs.',
    category: 'Commerce de proximité',
    address: '2 place de la Mairie',
    city: 'Nancy',
    status: 'rejected',
    submitted_at: '2026-08-19T13:15:00Z',
    decisions: [
      {
        id: 'd4',
        from_status: 'pending',
        to_status: 'rejected',
        reason:
          "La vente de tabac et les jeux de hasard sont exclus des catégories éligibles au dispositif. L'établissement pourra déposer un nouveau dossier si une activité distincte, séparément immatriculée, devient éligible.",
        decided_by: 'Jean-Eudes Berlier',
        decided_at: '2026-08-21T15:30:00Z',
      },
    ],
  },
];

export const MOCK_ENTRIES: WalletEntry[] = [
  {
    id: 'e1',
    direction: 'debit',
    amount_cents: 1250,
    kind: 'payment',
    partner_name: 'Glaces Artisanales Corrèze',
    occurred_at: '2026-09-02T14:20:00Z',
  },
  {
    id: 'e2',
    direction: 'debit',
    amount_cents: 3400,
    kind: 'payment',
    partner_name: 'KostumParty',
    occurred_at: '2026-09-01T12:05:00Z',
  },
  {
    id: 'e3',
    direction: 'credit',
    amount_cents: 15000,
    kind: 'allocation',
    occurred_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'e4',
    direction: 'debit',
    amount_cents: 4500,
    kind: 'payment',
    partner_name: 'Poney Dream 78',
    occurred_at: '2026-08-29T09:30:00Z',
  },
  {
    id: 'e5',
    direction: 'debit',
    amount_cents: 2100,
    kind: 'payment',
    partner_name: 'Glaces Artisanales Corrèze',
    occurred_at: '2026-08-22T17:45:00Z',
  },
  {
    id: 'e6',
    direction: 'credit',
    amount_cents: 8000,
    kind: 'allocation',
    occurred_at: '2026-08-01T08:00:00Z',
  },
];
