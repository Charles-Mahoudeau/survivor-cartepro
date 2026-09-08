import type { Role } from '../../src/config/auth/auth.constants';
import { ROLES } from '../../src/config/auth/auth.constants';
import { CaptureMode } from '../../src/modules/payments/core/enums/capture-mode.enum';
import { PaymentStatus } from '../../src/modules/payments/core/enums/payment-status.enum';
import { PartnerStatus } from '../../src/modules/partners/core/enums/partner-status.enum';
import { WALLET_OVERDRAFT_LIMIT } from '../../src/modules/wallets/constants';
import { isDebitAllowed } from '../../src/modules/wallets/services/helpers/wallet-overdraft.helper';
import {
  ADMINS,
  AMOUNT_RANGES_CENTS,
  CATEGORIES,
  CLOSING_PAYMENT_CATEGORIES,
  CLOSING_PAYMENT_HOURS,
  DEMO_EMPLOYEE_NAME,
  EMPLOYERS,
  FIRST_NAMES,
  LAST_NAMES,
  LOW_BALANCE_CEILING_CENTS,
  LOW_BALANCE_EMPLOYEES,
  MIN_REFUSED_TRANSACTIONS,
  PARTNERS,
  PAYMENT_HOURS,
  QR_CODE_SHARE,
  SEED_RANDOM_SEED,
  SEED_REFERENCE_DATE,
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
  SPENDING_PROFILES,
  TOKEN_LEAD_TIME_MS,
  TOKEN_LIFETIME_MS,
  TRANSACTION_COUNT,
  TRANSACTION_WINDOW_DAYS,
  WALLET_OPENING_DATE,
  ZERO_BALANCE_EMPLOYEES,
  type CategorySlug,
  type SeedAccount,
  type SeedCategory,
  type SpendingProfile,
} from './dataset';
import { SeededRandom } from './random';
import { uuidv7At } from './uuid';

/**
 * Turns the dataset into every row the seed will write, ids and dates
 * included, without touching a database. It replays the dispositif the way the
 * application would: allocations land, employees pay, and a payment is refused
 * when the wallet's own rule says so — never by setting a status by hand.
 */

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const CENTS_PER_EURO = 100;

/** Two events of one wallet never share an instant, so their ids never tie. */
const SAME_WALLET_GAP_MS = SECOND_MS;

/** How baskets end at a till: round euros most of the time. */
const AMOUNT_ENDINGS: readonly {
  value: 'round' | 'half' | 'ninety' | 'any';
  weight: number;
}[] = [
  { value: 'round', weight: 40 },
  { value: 'half', weight: 25 },
  { value: 'ninety', weight: 20 },
  { value: 'any', weight: 15 },
];

export interface PlannedAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface PlannedApplication {
  id: string;
  partnerId: string;
  fromStatus: PartnerStatus;
  toStatus: PartnerStatus;
  reason: string;
  decidedById: string;
  createdAt: Date;
}

export interface PlannedPartner {
  id: string;
  ownerId: string;
  legalName: string;
  tradeName: string;
  siren: string;
  businessPurpose: string;
  status: PartnerStatus;
  categorySlugs: CategorySlug[];
  addressLine: string;
  postalCode: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  activeSince: Date | null;
  applications: PlannedApplication[];
}

export interface PlannedAllocation {
  id: string;
  employerId: string;
  label: string;
  amountCents: number;
  createdById: string;
  createdAt: Date;
}

export interface PlannedEmployer {
  id: string;
  ownerId: string;
  name: string;
  siren: string;
  createdAt: Date;
  allocations: PlannedAllocation[];
}

export interface PlannedWallet {
  id: string;
  userId: string;
  employerId: string;
  employeeRef: string;
  createdAt: Date;
  employee: { name: string; email: string };
  profile: SpendingProfile;
}

export interface CreditEvent {
  kind: 'credit';
  at: Date;
  walletId: string;
  allocationId: string;
  amountCents: number;
  entryId: string;
  balanceAfterCents: number;
}

export interface PaymentEvent {
  kind: 'payment';
  at: Date;
  walletId: string;
  partnerId: string;
  amountCents: number;
  status: PaymentStatus;
  captureMode: CaptureMode;
  paymentId: string;
  token: {
    id: string;
    shortCode: string;
    createdAt: Date;
    expiresAt: Date;
    consumedAt: Date;
  };
  /** Null on a refusal: nothing moved, so nothing is written to the ledger. */
  entryId: string | null;
  balanceAfterCents: number;
}

export type PlannedEvent = CreditEvent | PaymentEvent;

/** One wallet's history, laid out for a human to recompute. */
export interface WalletCase {
  wallet: PlannedWallet;
  credits: { at: Date; label: string; amountCents: number }[];
  debits: {
    at: Date;
    partner: string;
    amountCents: number;
    status: PaymentStatus;
  }[];
  creditedCents: number;
  debitedCents: number;
  finalBalanceCents: number;
}

export interface SeedSummary {
  refusedTransactions: number;
  zeroBalances: number;
  lowBalances: number;
  negativeBalances: number;
  minBalanceCents: number;
  maxBalanceCents: number;
  partnersByCategory: Map<string, number>;
  partnersByRegion: Map<string, number>;
  zeroCase: WalletCase;
}

export interface SeedPlan {
  accounts: PlannedAccount[];
  categories: SeedCategory[];
  partners: PlannedPartner[];
  employers: PlannedEmployer[];
  wallets: PlannedWallet[];
  /** Chronological, per wallet strictly increasing. */
  events: PlannedEvent[];
  finalBalancesCents: Map<string, number>;
  summary: SeedSummary;
}

interface PaymentDraft {
  at: Date;
  wallet: PlannedWallet;
  /** `zero` empties the wallet, `low` leaves a few cents; both on the last day. */
  closing: 'zero' | 'low' | null;
}

type TimelineItem =
  | {
      kind: 'credit';
      at: Date;
      wallet: PlannedWallet;
      allocation: PlannedAllocation;
    }
  | { kind: 'payment'; at: Date; wallet: PlannedWallet; draft: PaymentDraft };

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function mustFind<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
  what: string,
): T {
  const found = items.find(predicate);
  if (found === undefined) {
    throw new Error(`Jeu de données incohérent : ${what}`);
  }
  return found;
}

function assertPlan(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Le jeu généré ne respecte pas la commande : ${message}`);
  }
}

class IdMint {
  private readonly minted = new Set<string>();

  constructor(private readonly random: SeededRandom) {}

  at(instant: Date): string {
    for (;;) {
      const id = uuidv7At(instant, this.random);
      if (!this.minted.has(id)) {
        this.minted.add(id);
        return id;
      }
    }
  }
}

function prettyAmount(
  random: SeededRandom,
  minCents: number,
  maxCents: number,
): number {
  const euros = random.int(
    Math.ceil(minCents / CENTS_PER_EURO),
    Math.floor(maxCents / CENTS_PER_EURO),
  );
  const ending = random.weighted(AMOUNT_ENDINGS);
  const cents =
    ending === 'round'
      ? 0
      : ending === 'half'
        ? 50
        : ending === 'ninety'
          ? 90
          : random.int(1, 99);
  return Math.max(minCents, euros * CENTS_PER_EURO + cents);
}

function instantOn(
  random: SeededRandom,
  day: Date,
  hours: { from: number; to: number },
): Date {
  return new Date(
    day.getTime() +
      random.int(hours.from, hours.to - 1) * HOUR_MS +
      random.int(0, 59) * MINUTE_MS +
      random.int(0, 59) * SECOND_MS,
  );
}

export function generateSeedPlan(): SeedPlan {
  const random = new SeededRandom(SEED_RANDOM_SEED);
  const mint = new IdMint(random);

  const accounts: PlannedAccount[] = [];
  const accountIdByEmail = new Map<string, string>();
  const usedNames = new Set<string>();
  const addAccount = (seed: SeedAccount): string => {
    if (accountIdByEmail.has(seed.email)) {
      throw new Error(
        `Jeu de données incohérent : adresse en double ${seed.email}`,
      );
    }
    const createdAt = new Date(seed.createdAt);
    const id = mint.at(createdAt);
    accounts.push({
      id,
      name: seed.name,
      email: seed.email,
      role: seed.role,
      createdAt,
    });
    accountIdByEmail.set(seed.email, id);
    usedNames.add(seed.name);
    return id;
  };

  ADMINS.forEach(addAccount);

  const partners: PlannedPartner[] = PARTNERS.map((seed) => {
    const ownerId = addAccount(seed.owner);
    const createdAt = new Date(seed.submittedAt);
    const id = mint.at(createdAt);
    const applications: PlannedApplication[] = seed.decisions.map(
      (decision) => {
        const decidedAt = new Date(decision.decidedAt);
        const decidedById = accountIdByEmail.get(decision.decidedByEmail);
        if (decidedById === undefined) {
          throw new Error(
            `Jeu de données incohérent : agent inconnu ${decision.decidedByEmail}`,
          );
        }
        return {
          id: mint.at(decidedAt),
          partnerId: id,
          fromStatus: decision.fromStatus,
          toStatus: decision.toStatus,
          reason: decision.reason,
          decidedById,
          createdAt: decidedAt,
        };
      },
    );
    const activation = applications.find(
      (application) => application.toStatus === PartnerStatus.ACTIVE,
    );
    return {
      id,
      ownerId,
      legalName: seed.legalName,
      tradeName: seed.tradeName,
      siren: seed.siren,
      businessPurpose: seed.businessPurpose,
      status: seed.status,
      categorySlugs: seed.categorySlugs,
      addressLine: seed.addressLine,
      postalCode: seed.postalCode,
      city: seed.city,
      region: seed.region,
      latitude: seed.latitude,
      longitude: seed.longitude,
      createdAt,
      activeSince:
        seed.status === PartnerStatus.ACTIVE && activation
          ? activation.createdAt
          : null,
      applications,
    };
  });

  const employers: PlannedEmployer[] = EMPLOYERS.map((seed) => {
    const ownerId = addAccount(seed.owner);
    const createdAt = new Date(seed.createdAt);
    const id = mint.at(createdAt);
    return {
      id,
      ownerId,
      name: seed.name,
      siren: seed.siren,
      createdAt,
      allocations: seed.allocations.map((allocation) => {
        const at = new Date(allocation.createdAt);
        return {
          id: mint.at(at),
          employerId: id,
          label: allocation.label,
          amountCents: allocation.amountCents,
          createdById: ownerId,
          createdAt: at,
        };
      }),
    };
  });

  const profiles = (Object.keys(SPENDING_PROFILES) as SpendingProfile[]).map(
    (profile) => ({
      value: profile,
      weight: SPENDING_PROFILES[profile].share,
    }),
  );
  const wallets: PlannedWallet[] = [];
  EMPLOYERS.forEach((seed, employerIndex) => {
    const employer = employers[employerIndex];
    for (let ordinal = 1; ordinal <= seed.headcount; ordinal++) {
      let firstName: string;
      let lastName: string;
      if (employerIndex === 0 && ordinal === 1) {
        ({ firstName, lastName } = DEMO_EMPLOYEE_NAME);
      } else {
        do {
          firstName = random.pick(FIRST_NAMES);
          lastName = random.pick(LAST_NAMES);
        } while (usedNames.has(`${firstName} ${lastName}`));
      }
      const name = `${firstName} ${lastName}`;
      const email = `${slugify(firstName)}.${slugify(lastName)}@${seed.emailDomain}`;
      const userId = addAccount({
        name,
        email,
        role: ROLES.EMPLOYEE,
        createdAt: WALLET_OPENING_DATE.toISOString(),
      });
      wallets.push({
        id: mint.at(WALLET_OPENING_DATE),
        userId,
        employerId: employer.id,
        employeeRef: `${seed.employeeRefPrefix}-${String(ordinal).padStart(4, '0')}`,
        createdAt: WALLET_OPENING_DATE,
        employee: { name, email },
        profile: random.weighted(profiles),
      });
    }
  });

  const windowStart = new Date(
    SEED_REFERENCE_DATE.getTime() - TRANSACTION_WINDOW_DAYS * DAY_MS,
  );
  const lastDay = new Date(SEED_REFERENCE_DATE.getTime() - DAY_MS);
  const weightedWallets = wallets.map((wallet) => ({
    value: wallet,
    weight: SPENDING_PROFILES[wallet.profile].weight,
  }));

  const drafts: PaymentDraft[] = [];
  const randomCount =
    TRANSACTION_COUNT - ZERO_BALANCE_EMPLOYEES - LOW_BALANCE_EMPLOYEES;
  for (let index = 0; index < randomCount; index++) {
    const day = new Date(
      windowStart.getTime() +
        random.int(0, TRANSACTION_WINDOW_DAYS - 1) * DAY_MS,
    );
    drafts.push({
      at: instantOn(random, day, PAYMENT_HOURS),
      wallet: random.weighted(weightedWallets),
      closing: null,
    });
  }
  const cohort = random
    .shuffle(wallets.filter((wallet) => wallet.profile === 'normal'))
    .slice(0, ZERO_BALANCE_EMPLOYEES + LOW_BALANCE_EMPLOYEES);
  cohort.forEach((wallet, index) => {
    drafts.push({
      at: instantOn(random, lastDay, CLOSING_PAYMENT_HOURS),
      wallet,
      closing: index < ZERO_BALANCE_EMPLOYEES ? 'zero' : 'low',
    });
  });

  const timeline: TimelineItem[] = [];
  for (const employer of employers) {
    for (const allocation of employer.allocations) {
      for (const wallet of wallets) {
        if (wallet.employerId === employer.id) {
          timeline.push({
            kind: 'credit',
            at: allocation.createdAt,
            wallet,
            allocation,
          });
        }
      }
    }
  }
  for (const draft of drafts) {
    timeline.push({
      kind: 'payment',
      at: draft.at,
      wallet: draft.wallet,
      draft,
    });
  }
  timeline.sort(
    (a, b) =>
      a.at.getTime() - b.at.getTime() ||
      (a.kind === 'credit' ? -1 : 1) - (b.kind === 'credit' ? -1 : 1),
  );

  const lastInstantByWallet = new Map<string, number>();
  for (const item of timeline) {
    const last = lastInstantByWallet.get(item.wallet.id);
    if (last !== undefined && item.at.getTime() <= last) {
      item.at = new Date(last + SAME_WALLET_GAP_MS);
    }
    lastInstantByWallet.set(item.wallet.id, item.at.getTime());
  }

  const activePartners = partners.filter(
    (partner) => partner.activeSince !== null,
  );
  const closingPartners = activePartners.filter((partner) =>
    partner.categorySlugs.some((slug) =>
      CLOSING_PAYMENT_CATEGORIES.includes(slug),
    ),
  );
  const shortCodes = new Set<string>();
  const nextShortCode = (): string => {
    for (;;) {
      let code = '';
      for (let index = 0; index < SHORT_CODE_LENGTH; index++) {
        code += random.pick([...SHORT_CODE_ALPHABET]);
      }
      if (!shortCodes.has(code)) {
        shortCodes.add(code);
        return code;
      }
    }
  };

  const balances = new Map<string, number>(
    wallets.map((wallet) => [wallet.id, 0]),
  );
  const events: PlannedEvent[] = [];
  for (const item of timeline) {
    const before = balances.get(item.wallet.id) ?? 0;

    if (item.kind === 'credit') {
      const after = before + item.allocation.amountCents;
      balances.set(item.wallet.id, after);
      events.push({
        kind: 'credit',
        at: item.at,
        walletId: item.wallet.id,
        allocationId: item.allocation.id,
        amountCents: item.allocation.amountCents,
        entryId: mint.at(item.at),
        balanceAfterCents: after,
      });
      continue;
    }

    const openAt = (partner: PlannedPartner) =>
      partner.activeSince !== null && partner.activeSince <= item.at;
    let partner: PlannedPartner;
    let amountCents: number;
    if (item.draft.closing !== null) {
      partner = random.pick(closingPartners.filter(openAt));
      amountCents =
        item.draft.closing === 'zero'
          ? before
          : before - random.int(1, LOW_BALANCE_CEILING_CENTS - 1);
      assertPlan(
        amountCents > 0,
        `${item.wallet.employee.name} devait vider son portefeuille mais ne détient que ${before} centimes`,
      );
    } else {
      partner = random.pick(activePartners.filter(openAt));
      const [min, max] = AMOUNT_RANGES_CENTS[partner.categorySlugs[0]];
      const factor = SPENDING_PROFILES[item.wallet.profile].amountFactor;
      amountCents = prettyAmount(
        random,
        Math.round(min * factor),
        Math.round(max * factor),
      );
    }

    const allowed = isDebitAllowed(
      before / CENTS_PER_EURO,
      amountCents / CENTS_PER_EURO,
    );
    const tokenCreatedAt = new Date(item.at.getTime() - TOKEN_LEAD_TIME_MS);
    const token = {
      id: mint.at(tokenCreatedAt),
      shortCode: nextShortCode(),
      createdAt: tokenCreatedAt,
      expiresAt: new Date(tokenCreatedAt.getTime() + TOKEN_LIFETIME_MS),
      consumedAt: item.at,
    };
    const paymentId = mint.at(item.at);
    const captureMode =
      random.next() < QR_CODE_SHARE
        ? CaptureMode.QR_CODE
        : CaptureMode.MANUAL_CODE;

    if (!allowed) {
      events.push({
        kind: 'payment',
        at: item.at,
        walletId: item.wallet.id,
        partnerId: partner.id,
        amountCents,
        status: PaymentStatus.REFUSED,
        captureMode,
        paymentId,
        token,
        entryId: null,
        balanceAfterCents: before,
      });
      continue;
    }

    const after = before - amountCents;
    balances.set(item.wallet.id, after);
    events.push({
      kind: 'payment',
      at: item.at,
      walletId: item.wallet.id,
      partnerId: partner.id,
      amountCents,
      status: PaymentStatus.VALIDATED,
      captureMode,
      paymentId,
      token,
      entryId: mint.at(item.at),
      balanceAfterCents: after,
    });
  }

  const payments = events.filter(
    (event): event is PaymentEvent => event.kind === 'payment',
  );
  const finalBalances = wallets.map((wallet) => balances.get(wallet.id) ?? 0);
  const summary: SeedSummary = {
    refusedTransactions: payments.filter(
      (payment) => payment.status === PaymentStatus.REFUSED,
    ).length,
    zeroBalances: finalBalances.filter((balance) => balance === 0).length,
    lowBalances: finalBalances.filter(
      (balance) => balance > 0 && balance < LOW_BALANCE_CEILING_CENTS,
    ).length,
    negativeBalances: finalBalances.filter((balance) => balance < 0).length,
    minBalanceCents: Math.min(...finalBalances),
    maxBalanceCents: Math.max(...finalBalances),
    partnersByCategory: countBy(
      partners,
      (partner) => partner.categorySlugs[0],
    ),
    partnersByRegion: countBy(partners, (partner) => partner.region),
    zeroCase: walletCase(cohort[0], events, partners, employers),
  };

  assertPlan(
    payments.length === TRANSACTION_COUNT,
    `${payments.length} transactions au lieu de ${TRANSACTION_COUNT}`,
  );
  assertPlan(
    summary.refusedTransactions >= MIN_REFUSED_TRANSACTIONS,
    `${summary.refusedTransactions} refus au lieu d'au moins ${MIN_REFUSED_TRANSACTIONS}`,
  );
  assertPlan(
    summary.zeroBalances === ZERO_BALANCE_EMPLOYEES,
    `${summary.zeroBalances} soldes à zéro au lieu de ${ZERO_BALANCE_EMPLOYEES}`,
  );
  assertPlan(
    summary.lowBalances >= LOW_BALANCE_EMPLOYEES,
    `${summary.lowBalances} soldes sous 5 € au lieu d'au moins ${LOW_BALANCE_EMPLOYEES}`,
  );
  assertPlan(
    summary.minBalanceCents >= -WALLET_OVERDRAFT_LIMIT * CENTS_PER_EURO,
    `un solde passe sous le découvert autorisé : ${summary.minBalanceCents} centimes`,
  );
  for (const payment of payments) {
    const partner = mustFind(
      partners,
      (candidate) => candidate.id === payment.partnerId,
      'partenaire payé inconnu',
    );
    assertPlan(
      partner.activeSince !== null && partner.activeSince <= payment.at,
      `${partner.tradeName} encaisse avant son activation`,
    );
  }

  return {
    accounts,
    categories: CATEGORIES,
    partners,
    employers,
    wallets,
    events,
    finalBalancesCents: balances,
    summary,
  };
}

function countBy<T>(
  items: readonly T[],
  key: (item: T) => string,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  }
  return counts;
}

function walletCase(
  wallet: PlannedWallet,
  events: readonly PlannedEvent[],
  partners: readonly PlannedPartner[],
  employers: readonly PlannedEmployer[],
): WalletCase {
  const allocations = employers.flatMap((employer) => employer.allocations);
  const credits: WalletCase['credits'] = [];
  const debits: WalletCase['debits'] = [];
  let finalBalanceCents = 0;
  for (const event of events) {
    if (event.walletId !== wallet.id) {
      continue;
    }
    if (event.kind === 'credit') {
      const allocation = mustFind(
        allocations,
        (candidate) => candidate.id === event.allocationId,
        'abondement inconnu',
      );
      credits.push({
        at: event.at,
        label: allocation.label,
        amountCents: event.amountCents,
      });
    } else {
      const partner = mustFind(
        partners,
        (candidate) => candidate.id === event.partnerId,
        'partenaire inconnu',
      );
      debits.push({
        at: event.at,
        partner: partner.tradeName,
        amountCents: event.amountCents,
        status: event.status,
      });
    }
    finalBalanceCents = event.balanceAfterCents;
  }
  const creditedCents = credits.reduce(
    (sum, credit) => sum + credit.amountCents,
    0,
  );
  const debitedCents = debits
    .filter((debit) => debit.status === PaymentStatus.VALIDATED)
    .reduce((sum, debit) => sum + debit.amountCents, 0);
  return {
    wallet,
    credits,
    debits,
    creditedCents,
    debitedCents,
    finalBalanceCents,
  };
}
