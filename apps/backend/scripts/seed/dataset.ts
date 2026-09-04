import { CaptureMode } from '../../src/modules/payments/core/enums/capture-mode.enum';
import { PartnerStatus } from '../../src/modules/partners/core/enums/partner-status.enum';
import { ROLES, type Role } from '../../src/config/auth/auth.constants';

/**
 * The recette dataset of the prototype, as the Direction Numérique asked for it:
 * fifty employees, twelve partners, two hundred transactions over ninety days.
 *
 * Nothing here is drawn at run time. What is listed is fixed; what is too
 * voluminous to list (employees, transactions) is generated from these lists
 * by a generator seeded with `SEED_RANDOM_SEED` and anchored on
 * `SEED_REFERENCE_DATE`, so two runs produce the same rows, ids included.
 *
 * The six partners named first are the ones of the brief (JEB/DNI/2026-002
 * §2.1) and of `apps/frontend/app/mock-data.ts`; the six that follow are the
 * first wave, active since May, so the earliest weeks have someone to pay.
 *
 * Amounts are in cents so a running balance never drifts; the writer divides
 * once, at the edge, into the `numeric(12,2)` columns.
 */

/** Everyone signs in with it. Long enough for `MIN_PASSWORD_LENGTH`. */
export const SEED_PASSWORD = 'TicketTout2026!';

/** Fixed on purpose: the whole dataset is a function of this number. */
export const SEED_RANDOM_SEED = 20260904;

/** The day the dataset describes. Every date below is relative to it, never to now. */
export const SEED_REFERENCE_DATE = new Date('2026-09-04T00:00:00Z');

export const TRANSACTION_WINDOW_DAYS = 90;
export const TRANSACTION_COUNT = 200;
export const MIN_REFUSED_TRANSACTIONS = 5;
export const ZERO_BALANCE_EMPLOYEES = 3;
export const LOW_BALANCE_EMPLOYEES = 2;
export const LOW_BALANCE_CEILING_CENTS = 500;

/** Wallets open, and the first allocation lands, before the window starts. */
export const WALLET_OPENING_DATE = new Date('2026-06-01T07:00:00Z');

/** Shops are paid during opening hours, inclusive lower bound, exclusive upper. */
export const PAYMENT_HOURS = { from: 9, to: 19 } as const;

/** The employees who empty their wallet do it in the closing hours of the last day. */
export const CLOSING_PAYMENT_HOURS = { from: 17, to: 19 } as const;

/** What the payment screen announces. */
export const TOKEN_LIFETIME_MS = 30 * 60 * 1000;
export const TOKEN_LEAD_TIME_MS = 60 * 1000;
export const QR_CODE_SHARE = 0.7;

/** Unambiguous glyphs only, as a code read aloud over a counter should be. */
export const SHORT_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const SHORT_CODE_LENGTH = 8;

export type SpendingProfile = 'light' | 'normal' | 'heavy';

/**
 * How often an employee shows up at a counter (`weight`), how many of them
 * behave that way (`share`) and how big their basket runs (`amountFactor`).
 * The heavy ones are the reason refusals happen without anyone forcing them.
 */
export const SPENDING_PROFILES: Record<
  SpendingProfile,
  { weight: number; share: number; amountFactor: number }
> = {
  light: { weight: 0.5, share: 0.25, amountFactor: 0.8 },
  normal: { weight: 2, share: 0.6, amountFactor: 1 },
  heavy: { weight: 6, share: 0.15, amountFactor: 1.5 },
};

export type CategorySlug =
  | 'sport-nature'
  | 'culture-loisirs'
  | 'alimentation'
  | 'mode-artisanat'
  | 'bien-etre'
  | 'commerce-proximite';

export interface SeedCategory {
  slug: CategorySlug;
  displayName: string;
}

export const CATEGORIES: SeedCategory[] = [
  { slug: 'sport-nature', displayName: 'Sport & Nature' },
  { slug: 'culture-loisirs', displayName: 'Culture & Loisirs' },
  { slug: 'alimentation', displayName: 'Alimentation' },
  { slug: 'mode-artisanat', displayName: 'Mode & Artisanat' },
  { slug: 'bien-etre', displayName: 'Bien-être' },
  { slug: 'commerce-proximite', displayName: 'Commerce de proximité' },
];

/** A plausible basket per category, in cents, before the profile factor. */
export const AMOUNT_RANGES_CENTS: Record<CategorySlug, [number, number]> = {
  alimentation: [350, 2800],
  'culture-loisirs': [900, 6500],
  'sport-nature': [1500, 9500],
  'mode-artisanat': [2500, 12000],
  'bien-etre': [3000, 9000],
  'commerce-proximite': [200, 1500],
};

/** Where an employee emptying a wallet of a few hundred euros is believable. */
export const CLOSING_PAYMENT_CATEGORIES: CategorySlug[] = [
  'sport-nature',
  'mode-artisanat',
  'bien-etre',
  'culture-loisirs',
];

export interface SeedAccount {
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface SeedDecision {
  fromStatus: PartnerStatus;
  toStatus: PartnerStatus;
  reason: string;
  decidedByEmail: string;
  decidedAt: string;
}

export interface SeedPartner {
  owner: SeedAccount;
  legalName: string;
  tradeName: string;
  siren: string;
  businessPurpose: string;
  status: PartnerStatus;
  categorySlugs: CategorySlug[];
  addressLine: string;
  postalCode: string;
  city: string;
  /** Not a column: the distribution the note asks for, reported at the end. */
  region: string;
  latitude: number;
  longitude: number;
  submittedAt: string;
  decisions: SeedDecision[];
}

export interface SeedAllocation {
  label: string;
  amountCents: number;
  createdAt: string;
}

export interface SeedEmployer {
  name: string;
  siren: string;
  /** Employee addresses are built on it. */
  emailDomain: string;
  /** Prefix of the employee references, `<prefix>-0001`. */
  employeeRefPrefix: string;
  headcount: number;
  createdAt: string;
  owner: SeedAccount;
  allocations: SeedAllocation[];
}

/** The account the decision history of every instructed dossier points to. */
export const REVIEWING_AGENT: SeedAccount = {
  name: 'Jean-Eudes Berlier',
  email: 'jean-eudes.berlier@ministere.gouv.fr',
  role: ROLES.ADMIN,
  createdAt: '2026-04-01T08:00:00Z',
};

/** The administration shortcut of the sign-in screen. */
export const DEMO_ADMIN: SeedAccount = {
  name: 'Jean Leclerc',
  email: 'jean.leclerc@ministere.gouv.fr',
  role: ROLES.ADMIN,
  createdAt: '2026-04-01T08:05:00Z',
};

export const ADMINS: SeedAccount[] = [DEMO_ADMIN, REVIEWING_AGENT];

/** The employee shortcut of the sign-in screen, first on the first payroll. */
export const DEMO_EMPLOYEE_NAME = { firstName: 'Marie', lastName: 'Dupont' };

function activation(decidedAt: string, reason: string): SeedDecision {
  return {
    fromStatus: PartnerStatus.PENDING,
    toStatus: PartnerStatus.ACTIVE,
    reason,
    decidedByEmail: REVIEWING_AGENT.email,
    decidedAt,
  };
}

/**
 * Coordinates are street-level approximations of the addresses, enough to
 * place a pin, not to find a door. Partners are written in filing order: the
 * id is a UUIDv7 minted at that instant, and the catalogue pages on it.
 */
export const PARTNERS: SeedPartner[] = [
  {
    owner: {
      name: 'Boulangerie Maison Aubry',
      email: 'contact@maison-aubry.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-05-04T08:40:00Z',
    },
    legalName: 'SARL MAISON AUBRY',
    tradeName: 'Boulangerie Maison Aubry',
    siren: '431874221',
    businessPurpose:
      'Boulangerie-pâtisserie artisanale, fabrication et vente de pain, viennoiseries et sandwichs.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['alimentation'],
    addressLine: '14 rue de Béthune',
    postalCode: '59000',
    city: 'Lille',
    region: 'Hauts-de-France',
    latitude: 50.6292,
    longitude: 3.0573,
    submittedAt: '2026-05-04T09:10:00Z',
    decisions: [
      activation(
        '2026-05-18T10:15:00Z',
        'SIREN vérifié. Artisan boulanger inscrit au répertoire des métiers, activité conforme à la catégorie Alimentation. Partenaire retenu pour la première vague.',
      ),
    ],
  },
  {
    owner: {
      name: 'Fromagerie des Alpages',
      email: 'contact@fromagerie-des-alpages.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-05-05T13:50:00Z',
    },
    legalName: 'FROMAGERIE DES ALPAGES SAS',
    tradeName: 'Fromagerie des Alpages',
    siren: '520398744',
    businessPurpose:
      'Affinage et vente de fromages fermiers de Savoie, plateaux et paniers garnis.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['alimentation'],
    addressLine: '3 rue Sainte-Claire',
    postalCode: '74000',
    city: 'Annecy',
    region: 'Auvergne-Rhône-Alpes',
    latitude: 45.8992,
    longitude: 6.1294,
    submittedAt: '2026-05-05T14:20:00Z',
    decisions: [
      activation(
        '2026-05-19T09:30:00Z',
        'Dossier complet. Commerce de bouche à enseigne physique, activité conforme à la catégorie Alimentation. Partenaire retenu pour la première vague.',
      ),
    ],
  },
  {
    owner: {
      name: 'Kayak Aventure Ardèche',
      email: 'contact@kayak-aventure-ardeche.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-05-06T10:05:00Z',
    },
    legalName: 'KAYAK AVENTURE ARDECHE SARL',
    tradeName: 'Kayak Aventure Ardèche',
    siren: '789456019',
    businessPurpose:
      'Location de canoës et kayaks, descentes encadrées des gorges de l’Ardèche et sorties de groupe.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['sport-nature'],
    addressLine: 'Route des Gorges',
    postalCode: '07150',
    city: 'Vallon-Pont-d’Arc',
    region: 'Auvergne-Rhône-Alpes',
    latitude: 44.4069,
    longitude: 4.3933,
    submittedAt: '2026-05-06T10:40:00Z',
    decisions: [
      activation(
        '2026-05-20T11:00:00Z',
        'SIREN vérifié, encadrement diplômé attesté. Activité de plein air conforme à la catégorie Sport & Nature. Partenaire retenu pour la première vague.',
      ),
    ],
  },
  {
    owner: {
      name: 'La Clé des Songes',
      email: 'contact@lacledessonges.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-05-07T15:20:00Z',
    },
    legalName: 'LA CLE DES SONGES SAS',
    tradeName: 'La Clé des Songes',
    siren: '348120650',
    businessPurpose:
      'Exploitation de salles d’escape game, animation de sessions pour particuliers et équipes.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['culture-loisirs'],
    addressLine: '22 rue Crébillon',
    postalCode: '44000',
    city: 'Nantes',
    region: 'Pays de la Loire',
    latitude: 47.2135,
    longitude: -1.5589,
    submittedAt: '2026-05-07T15:45:00Z',
    decisions: [
      activation(
        '2026-05-22T14:10:00Z',
        'Dossier complet. Activité de loisirs en salle, ouverte aux groupes, conforme à la catégorie Culture & Loisirs. Partenaire retenu pour la première vague.',
      ),
    ],
  },
  {
    owner: {
      name: 'Maroquinerie Le Guen',
      email: 'contact@maroquinerie-leguen.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-05-11T09:00:00Z',
    },
    legalName: 'MAROQUINERIE LE GUEN',
    tradeName: 'Maroquinerie Le Guen',
    siren: '654209816',
    businessPurpose:
      'Fabrication artisanale et vente d’articles de maroquinerie, réparation de cuir.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['mode-artisanat'],
    addressLine: '9 rue Saint-Michel',
    postalCode: '35000',
    city: 'Rennes',
    region: 'Bretagne',
    latitude: 48.1146,
    longitude: -1.6806,
    submittedAt: '2026-05-11T09:30:00Z',
    decisions: [
      activation(
        '2026-05-26T10:45:00Z',
        'Artisan maroquinier inscrit au répertoire des métiers. Activité conforme à la catégorie Mode & Artisanat. Partenaire retenu pour la première vague.',
      ),
    ],
  },
  {
    owner: {
      name: 'Océane Bien-Être',
      email: 'contact@oceane-bien-etre.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-05-12T11:15:00Z',
    },
    legalName: 'OCEANE BIEN-ETRE SARL',
    tradeName: 'Océane Bien-Être',
    siren: '917305468',
    businessPurpose:
      'Institut de bien-être : massages, soins du corps, espace sauna et hammam.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['bien-etre'],
    addressLine: '45 cours de l’Intendance',
    postalCode: '33000',
    city: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    latitude: 44.8412,
    longitude: -0.5769,
    submittedAt: '2026-05-12T11:40:00Z',
    decisions: [
      activation(
        '2026-05-27T16:20:00Z',
        'Dossier complet. Établissement de soins non médicaux, activité conforme à la catégorie Bien-être. Partenaire retenu pour la première vague.',
      ),
    ],
  },
  {
    owner: {
      name: 'Poney Dream 78',
      email: 'contact@poneydream78.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-08-04T08:45:00Z',
    },
    legalName: 'SARL PONEY DREAM 78',
    tradeName: 'Poney Dream 78',
    siren: '812456903',
    businessPurpose:
      "Exploitation d'un centre équestre, enseignement de l'équitation et organisation de séminaires de cohésion en plein air.",
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['sport-nature'],
    addressLine: 'Chemin des Écuries',
    postalCode: '78120',
    city: 'Rambouillet',
    region: 'Île-de-France',
    latitude: 48.644,
    longitude: 1.829,
    submittedAt: '2026-08-04T09:10:00Z',
    decisions: [
      activation(
        '2026-08-06T10:25:00Z',
        "SIREN vérifié auprès de l'INSEE. Activité équestre et séminaires de cohésion conformes à la catégorie Sport & Nature. Partenaire retenu pour le lancement.",
      ),
    ],
  },
  {
    owner: {
      name: 'KostumParty',
      email: 'contact@kostumparty.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-08-05T14:10:00Z',
    },
    legalName: 'KOSTUMPARTY SAS',
    tradeName: 'KostumParty',
    siren: '504118276',
    businessPurpose:
      'Vente et location de déguisements, costumes de scène et accessoires de fête.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['culture-loisirs'],
    addressLine: '37 rue Oberkampf',
    postalCode: '75011',
    city: 'Paris 11e',
    region: 'Île-de-France',
    latitude: 48.8646,
    longitude: 2.3708,
    submittedAt: '2026-08-05T14:40:00Z',
    decisions: [
      activation(
        '2026-08-07T11:05:00Z',
        'Dossier complet. Boutique physique ouverte six jours sur sept, activité éligible au titre des loisirs. Partenaire retenu pour le lancement.',
      ),
    ],
  },
  {
    owner: {
      name: 'Glaces Artisanales Corrèze',
      email: 'contact@glaces-correze.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-08-08T08:00:00Z',
    },
    legalName: 'GLACES ARTISANALES DE LA CORREZE',
    tradeName: 'Glaces Artisanales Corrèze',
    siren: '893207415',
    businessPurpose:
      'Fabrication artisanale de crèmes glacées et sorbets, vente en ligne et retrait en atelier.',
    status: PartnerStatus.ACTIVE,
    categorySlugs: ['alimentation'],
    addressLine: '12 avenue de la Gare',
    postalCode: '19100',
    city: 'Brive-la-Gaillarde',
    region: 'Nouvelle-Aquitaine',
    latitude: 45.159,
    longitude: 1.533,
    submittedAt: '2026-08-08T08:30:00Z',
    decisions: [
      activation(
        '2026-08-10T09:50:00Z',
        'Artisan glacier immatriculé à la chambre de métiers. Vente en ligne et retrait sur place, les deux canaux acceptent le paiement Ticket Tout. Partenaire retenu pour le lancement.',
      ),
    ],
  },
  {
    owner: {
      name: 'Tabac Presse de la Mairie',
      email: 'contact@tabacpressemairie.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-08-19T12:50:00Z',
    },
    legalName: 'SNC TABAC PRESSE DE LA MAIRIE',
    tradeName: 'Tabac Presse de la Mairie',
    siren: '725390184',
    businessPurpose:
      'Débit de tabac, vente de journaux, jeux de hasard et articles de fumeurs.',
    status: PartnerStatus.REFUSED,
    categorySlugs: ['commerce-proximite'],
    addressLine: '2 place de la Mairie',
    postalCode: '54000',
    city: 'Nancy',
    region: 'Grand Est',
    latitude: 48.693,
    longitude: 6.183,
    submittedAt: '2026-08-19T13:15:00Z',
    decisions: [
      {
        fromStatus: PartnerStatus.PENDING,
        toStatus: PartnerStatus.REFUSED,
        reason:
          "La vente de tabac et les jeux de hasard sont exclus des catégories éligibles au dispositif. L'établissement pourra déposer un nouveau dossier si une activité distincte, séparément immatriculée, devient éligible.",
        decidedByEmail: REVIEWING_AGENT.email,
        decidedAt: '2026-08-21T15:30:00Z',
      },
    ],
  },
  {
    owner: {
      name: 'Chapelier Fontaine',
      email: 'contact@chapelier-fontaine.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-09-01T15:55:00Z',
    },
    legalName: 'FONTAINE CHAPELLERIE',
    tradeName: 'Chapelier Fontaine',
    siren: '417830562',
    businessPurpose:
      'Fabrication et vente de chapeaux en feutre de laine, réparation et remise en forme.',
    status: PartnerStatus.PENDING,
    categorySlugs: ['mode-artisanat'],
    addressLine: '5 rue des Filatiers',
    postalCode: '31000',
    city: 'Toulouse',
    region: 'Occitanie',
    latitude: 43.599,
    longitude: 1.443,
    submittedAt: '2026-09-01T16:20:00Z',
    decisions: [],
  },
  {
    owner: {
      name: 'Librairie du Vieux Port',
      email: 'contact@librairieduvieuxport.fr',
      role: ROLES.PARTNER,
      createdAt: '2026-09-02T10:20:00Z',
    },
    legalName: 'LIBRAIRIE DU VIEUX PORT SARL',
    tradeName: 'Librairie du Vieux Port',
    siren: '639014728',
    businessPurpose:
      "Commerce de détail de livres neufs et d'occasion, papeterie et organisation de rencontres d'auteurs.",
    status: PartnerStatus.PENDING,
    categorySlugs: ['culture-loisirs'],
    addressLine: '8 quai du Port',
    postalCode: '13002',
    city: 'Marseille',
    region: 'Provence-Alpes-Côte d’Azur',
    latitude: 43.296,
    longitude: 5.369,
    submittedAt: '2026-09-02T10:45:00Z',
    decisions: [],
  },
];

/**
 * Three payrolls, fifty employees between them. An owner holds `employee` like
 * everyone who is neither a partner nor an agent: the role column is scalar
 * and the brief defines exactly three spaces. Owners carry no wallet, which
 * also keeps the 404 of `GET /me/wallet` reachable from a real account.
 */
export const EMPLOYERS: SeedEmployer[] = [
  {
    name: 'Groupe Entreprise France',
    siren: '903172641',
    emailDomain: 'entreprise.fr',
    employeeRefPrefix: 'GEF',
    headcount: 24,
    createdAt: '2026-05-28T09:00:00Z',
    owner: {
      name: 'Sophie Bernard',
      email: 'sophie.bernard@entreprise.fr',
      role: ROLES.EMPLOYEE,
      createdAt: '2026-05-28T08:55:00Z',
    },
    allocations: [
      {
        label: 'Abondement de juin 2026',
        amountCents: 8000,
        createdAt: '2026-06-01T08:00:00Z',
      },
      {
        label: 'Abondement de juillet 2026',
        amountCents: 8000,
        createdAt: '2026-07-01T08:00:00Z',
      },
      {
        label: "Abondement d'août 2026",
        amountCents: 8000,
        createdAt: '2026-08-01T08:00:00Z',
      },
      {
        label: 'Abondement de septembre 2026',
        amountCents: 15000,
        createdAt: '2026-09-01T08:00:00Z',
      },
    ],
  },
  {
    name: 'Normandie Logistique Services',
    siren: '498231505',
    emailDomain: 'normandie-logistique.fr',
    employeeRefPrefix: 'NLS',
    headcount: 16,
    createdAt: '2026-05-28T10:30:00Z',
    owner: {
      name: 'Marc Lefebvre',
      email: 'marc.lefebvre@normandie-logistique.fr',
      role: ROLES.EMPLOYEE,
      createdAt: '2026-05-28T10:25:00Z',
    },
    allocations: [
      {
        label: 'Abondement de juin 2026',
        amountCents: 10000,
        createdAt: '2026-06-01T08:30:00Z',
      },
      {
        label: 'Abondement de juillet 2026',
        amountCents: 10000,
        createdAt: '2026-07-01T08:30:00Z',
      },
      {
        label: "Abondement d'août 2026",
        amountCents: 10000,
        createdAt: '2026-08-01T08:30:00Z',
      },
      {
        label: 'Abondement de septembre 2026',
        amountCents: 10000,
        createdAt: '2026-09-01T08:30:00Z',
      },
    ],
  },
  {
    name: 'Cabinet Vidal & Associés',
    siren: '751026394',
    emailDomain: 'cabinet-vidal.fr',
    employeeRefPrefix: 'CVA',
    headcount: 10,
    createdAt: '2026-05-29T14:00:00Z',
    owner: {
      name: 'Nadia Benali',
      email: 'nadia.benali@cabinet-vidal.fr',
      role: ROLES.EMPLOYEE,
      createdAt: '2026-05-29T13:55:00Z',
    },
    allocations: [
      {
        label: 'Abondement de juin 2026',
        amountCents: 6000,
        createdAt: '2026-06-01T09:00:00Z',
      },
      {
        label: 'Abondement de juillet 2026',
        amountCents: 6000,
        createdAt: '2026-07-01T09:00:00Z',
      },
      {
        label: "Abondement d'été 2026",
        amountCents: 12000,
        createdAt: '2026-08-01T09:00:00Z',
      },
      {
        label: 'Abondement de septembre 2026',
        amountCents: 6000,
        createdAt: '2026-09-01T09:00:00Z',
      },
    ],
  },
];

/** Names are drawn from these pools; a pair is never used twice. */
export const FIRST_NAMES = [
  'Marie',
  'Karim',
  'Léa',
  'Thomas',
  'Julien',
  'Camille',
  'Nicolas',
  'Inès',
  'Mehdi',
  'Chloé',
  'Antoine',
  'Manon',
  'Lucas',
  'Sarah',
  'Hugo',
  'Emma',
  'Yanis',
  'Louise',
  'Maxime',
  'Clara',
  'Romain',
  'Amina',
  'Pierre',
  'Élise',
  'Bastien',
  'Nora',
  'Adrien',
  'Fatou',
  'Quentin',
  'Anaïs',
  'Kevin',
  'Océane',
  'Rayan',
  'Justine',
  'Florian',
  'Lina',
  'Guillaume',
  'Aurélie',
  'Samuel',
  'Mathilde',
  'Idriss',
  'Margaux',
];

export const LAST_NAMES = [
  'Dupont',
  'Haddad',
  'Moreau',
  'Girard',
  'Martin',
  'Petit',
  'Robert',
  'Richard',
  'Durand',
  'Dubois',
  'Lefèvre',
  'Garcia',
  'Roux',
  'Fournier',
  'Lambert',
  'Rousseau',
  'Vincent',
  'Muller',
  'Fontaine',
  'Chevalier',
  'Robin',
  'Masson',
  'Marchand',
  'Blanc',
  'Guérin',
  'Boyer',
  'Garnier',
  'Nguyen',
  'Diallo',
  'Perez',
  'Da Silva',
  'Lemoine',
  'Picard',
  'Renard',
  'Bouchet',
  'Meyer',
  'Traoré',
  'Schmitt',
  'Leroy',
  'Morel',
];

export { CaptureMode, PartnerStatus };
