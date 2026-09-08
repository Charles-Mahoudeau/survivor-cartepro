#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { DataSource, type EntityManager } from 'typeorm';
import { auth, authOptions } from '../src/config/auth/auth';
import { registerAuthProvisioning } from '../src/config/auth/auth-provisioning';
import { buildDataSourceOptions } from '../src/config/database/data-source';
import { Allocation } from '../src/modules/allocations/entities/allocation.entity';
import { AllocationStatus } from '../src/modules/allocations/enums/allocation-status.enum';
import { Employer } from '../src/modules/employers/entities/employer.entity';
import { PartnerCategory } from '../src/modules/partners/categories/entities/partner-category.entity';
import { Partner } from '../src/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '../src/modules/partners/core/enums/partner-status.enum';
import { Application } from '../src/modules/partners/applications/entities/application.entity';
import { Payment } from '../src/modules/payments/core/entities/payment.entity';
import { PaymentToken } from '../src/modules/payments/core/entities/payment-token.entity';
import { PaymentStatus } from '../src/modules/payments/core/enums/payment-status.enum';
import { PaymentTokenStatus } from '../src/modules/payments/core/enums/payment-token-status.enum';
import { TRANSACTIONS_CSV_FILENAME } from '../src/modules/payments/transactions/constants';
import { TransactionRepo } from '../src/modules/payments/transactions/repos/transaction.repo';
import { TransactionService } from '../src/modules/payments/transactions/services/transaction.service';
import { User } from '../src/modules/user/entities';
import { UserRepo } from '../src/modules/user/repos/user.repo';
import { UserService } from '../src/modules/user/services/user.service';
import { Wallet } from '../src/modules/wallets/entities/wallet.entity';
import { WalletEntry } from '../src/modules/wallets/entities/wallet-entry.entity';
import { WalletEntryDirection } from '../src/modules/wallets/enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '../src/modules/wallets/enums/wallet-entry-kind.enum';
import { WalletEntryRepo } from '../src/modules/wallets/repos/wallet-entry.repo';
import { WalletRepo } from '../src/modules/wallets/repos/wallet.repo';
import { WalletService } from '../src/modules/wallets/services/wallet.service';
import { truncateAll } from '../test/db/truncate';
import { connect, describeConnection, fail } from './db-common';
import {
  DEMO_ADMIN,
  EMPLOYERS,
  PARTNERS,
  SEED_PASSWORD,
  SEED_RANDOM_SEED,
  SEED_REFERENCE_DATE,
  TRANSACTION_WINDOW_DAYS,
} from './seed/dataset';
import {
  generateSeedPlan,
  type PlannedAccount,
  type PlannedEvent,
  type SeedPlan,
  type WalletCase,
} from './seed/generator';

/**
 * Fills an empty database with the recette dataset, then writes the CSV
 * export of its transactions.
 *
 * The rows are decided before the first connection, by `generateSeedPlan`,
 * so a dataset that would not meet the order fails without writing anything.
 *
 * Accounts go through Better Auth rather than an INSERT: a `user` row with no
 * `account` row cannot sign in, and hashing a password here would be a second
 * implementation of the one thing nobody should implement twice. The planned
 * id and creation date are handed to it, so they survive a re-run.
 *
 * Everything else is written through the entities, in the order the
 * application would have written it: an allocation credits a wallet, a payment
 * debits it or is refused, and the balance moves with each entry. Nothing is
 * corrected afterwards.
 *
 * The CSV is produced by `TransactionService`, the class behind
 * `GET /admin/transactions.csv`: one code path, so the file and the endpoint
 * cannot differ by a byte.
 */

const EXPORT_DIRECTORY = join(import.meta.dir, '..', 'exports');
const CENTS_PER_EURO = 100;

const reset = process.argv.slice(2).includes('--reset');

if (process.env.NODE_ENV === 'production') {
  console.log('');
  console.log(chalk.bold.red('db:seed est interdit en production.'));
  console.log(chalk.gray(`└─ Cible : ${describeConnection()}`));
  console.log('');
  process.exit(1);
}

/**
 * Query logging off: the dataset is a thousand inserts, and the point of the
 * run is the summary at the end.
 */
const dataSource = new DataSource({
  ...buildDataSourceOptions({ ...process.env, DATABASE_LOGGING: 'false' }),
  migrationsRun: false,
});

function euros(cents: number): number {
  return cents / CENTS_PER_EURO;
}

function formatEuros(cents: number): string {
  const sign = cents < 0 ? '−' : '';
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / CENTS_PER_EURO)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const fraction = String(absolute % CENTS_PER_EURO).padStart(2, '0');
  return `${sign}${whole},${fraction} €`;
}

function formatDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The role travels in `data`, not in `role`: the library types that field with
 * its own two default roles, while the column takes whatever the dispositif
 * defines. Both land in the same place, and `data` keeps `updated_at` planned.
 */
async function createAccount(account: PlannedAccount): Promise<void> {
  const { user } = await auth.api.createUser({
    body: {
      email: account.email,
      password: SEED_PASSWORD,
      name: account.name,
      data: {
        id: account.id,
        role: account.role,
        createdAt: account.createdAt,
        updatedAt: account.createdAt,
      },
    },
  });

  if (user.id !== account.id || user.role !== account.role) {
    throw new Error(
      `Better Auth n'a pas conservé l'identifiant ou le rôle prévus pour ${account.email}`,
    );
  }
}

async function writeEvent(
  manager: EntityManager,
  event: PlannedEvent,
): Promise<void> {
  if (event.kind === 'credit') {
    await manager.insert(WalletEntry, {
      id: event.entryId,
      wallet: { id: event.walletId },
      direction: WalletEntryDirection.CREDIT,
      amount: euros(event.amountCents),
      balanceAfter: euros(event.balanceAfterCents),
      kind: WalletEntryKind.ALLOCATION_RECEIVED,
      allocation: { id: event.allocationId },
      createdAt: event.at,
    });
    await manager.update(
      Wallet,
      { id: event.walletId },
      { balance: euros(event.balanceAfterCents), updatedAt: event.at },
    );
    return;
  }

  await manager.insert(PaymentToken, {
    id: event.token.id,
    wallet: { id: event.walletId },
    shortCode: event.token.shortCode,
    status: PaymentTokenStatus.CONSUMED,
    expiresAt: event.token.expiresAt,
    consumedAt: event.token.consumedAt,
    createdAt: event.token.createdAt,
  });
  await manager.insert(Payment, {
    id: event.paymentId,
    wallet: { id: event.walletId },
    partner: { id: event.partnerId },
    amount: euros(event.amountCents),
    paymentToken: { id: event.token.id },
    captureMode: event.captureMode,
    status: event.status,
    createdAt: event.at,
  });

  if (event.entryId === null) {
    return;
  }

  await manager.insert(WalletEntry, {
    id: event.entryId,
    wallet: { id: event.walletId },
    direction: WalletEntryDirection.DEBIT,
    amount: euros(event.amountCents),
    balanceAfter: euros(event.balanceAfterCents),
    kind: WalletEntryKind.PAYMENT_SENT,
    payment: { id: event.paymentId },
    createdAt: event.at,
  });
  await manager.update(
    Wallet,
    { id: event.walletId },
    { balance: euros(event.balanceAfterCents), updatedAt: event.at },
  );
}

async function writePlan(
  manager: EntityManager,
  plan: SeedPlan,
): Promise<void> {
  await manager.insert(PartnerCategory, plan.categories);

  for (const partner of plan.partners) {
    await manager.insert(Partner, {
      id: partner.id,
      owner: { id: partner.ownerId },
      legalName: partner.legalName,
      tradeName: partner.tradeName,
      siren: partner.siren,
      businessPurpose: partner.businessPurpose,
      status: partner.status,
      addressLine: partner.addressLine,
      postalCode: partner.postalCode,
      city: partner.city,
      latitude: partner.latitude,
      longitude: partner.longitude,
      createdAt: partner.createdAt,
      updatedAt: partner.createdAt,
    });
    await manager
      .createQueryBuilder()
      .relation(Partner, 'categories')
      .of(partner.id)
      .add(partner.categorySlugs);
    for (const application of partner.applications) {
      await manager.insert(Application, {
        id: application.id,
        partner: { id: application.partnerId },
        fromStatus: application.fromStatus,
        toStatus: application.toStatus,
        reason: application.reason,
        decidedBy: { id: application.decidedById },
        createdAt: application.createdAt,
      });
    }
  }

  for (const employer of plan.employers) {
    await manager.insert(Employer, {
      id: employer.id,
      owner: { id: employer.ownerId },
      name: employer.name,
      siren: employer.siren,
      createdAt: employer.createdAt,
      updatedAt: employer.createdAt,
    });
    for (const allocation of employer.allocations) {
      await manager.insert(Allocation, {
        id: allocation.id,
        employer: { id: allocation.employerId },
        label: allocation.label,
        amount: euros(allocation.amountCents),
        status: AllocationStatus.APPLIED,
        appliedAt: allocation.createdAt,
        createdBy: { id: allocation.createdById },
        createdAt: allocation.createdAt,
      });
    }
  }

  /**
   * `createAccount` triggers the same wallet-provisioning hook the real app
   * runs on sign-up, so every account above already has an empty personal
   * wallet. Discarding them here keeps this plan's ids and timestamps as the
   * only ones that exist, so nothing downstream (the events below, id by id)
   * needs to know about the auto-created rows.
   */
  await manager.createQueryBuilder().delete().from(Wallet).execute();

  for (const wallet of plan.wallets) {
    await manager.insert(Wallet, {
      id: wallet.id,
      user: { id: wallet.userId },
      employer: { id: wallet.employerId },
      employeeRef: wallet.employeeRef,
      balance: 0,
      createdAt: wallet.createdAt,
      updatedAt: wallet.createdAt,
    });
  }

  for (const event of plan.events) {
    await writeEvent(manager, event);
  }
}

function printCase(walletCase: WalletCase): void {
  const { wallet } = walletCase;
  console.log(
    chalk.gray('└─ Cas détaillé : ') +
      chalk.white(`${wallet.employee.name} (${wallet.employeeRef})`),
  );
  const credits = walletCase.credits
    .map(
      (credit) => `${formatDay(credit.at)} +${formatEuros(credit.amountCents)}`,
    )
    .join(' · ');
  console.log(
    chalk.gray('   Abondements : ') +
      chalk.white(`${credits} = ${formatEuros(walletCase.creditedCents)}`),
  );
  const debits = walletCase.debits
    .map(
      (debit) =>
        `${formatDay(debit.at)} −${formatEuros(debit.amountCents)} ${debit.partner}` +
        (debit.status === PaymentStatus.REFUSED ? ' (refusé)' : ''),
    )
    .join(' · ');
  console.log(
    chalk.gray('   Débits      : ') +
      chalk.white(`${debits} = ${formatEuros(walletCase.debitedCents)}`),
  );
  console.log(
    chalk.gray('   Recalcul    : ') +
      chalk.white(
        `${formatEuros(walletCase.creditedCents)} − ${formatEuros(walletCase.debitedCents)} = ${formatEuros(walletCase.finalBalanceCents)}`,
      ),
  );
}

console.log(chalk.yellow('Chargement du jeu de données de recette...'));
console.log(chalk.gray(`Database: ${describeConnection()}`));

const plan = generateSeedPlan();

try {
  await connect(dataSource);

  /**
   * No Nest container here, so the same bridge `bootstrap.ts` uses for the
   * real app is wired by hand — `createAccount` below goes through Better
   * Auth's own API, which fires the same wallet-provisioning hook.
   */
  registerAuthProvisioning({
    walletService: new WalletService(
      new WalletRepo(dataSource.getRepository(Wallet)),
      new WalletEntryRepo(dataSource.getRepository(WalletEntry)),
    ),
    userService: new UserService(new UserRepo(dataSource.getRepository(User))),
  });

  const existingUsers = await dataSource.getRepository(User).count();
  if (existingUsers > 0 && !reset) {
    await dataSource.destroy();
    await authOptions.database.end();
    console.log('');
    console.log(
      chalk.bold.red(`La base contient déjà ${existingUsers} comptes.`),
    );
    console.log(
      chalk.gray('└─ ') +
        chalk.white('Pour la vider et la recharger : bun run db:seed --reset'),
    );
    console.log('');
    process.exit(1);
  }

  if (reset) {
    await truncateAll(dataSource);
    console.log(chalk.gray('├─ Tables vidées'));
  }

  for (const account of plan.accounts) {
    await createAccount(account);
  }
  console.log(chalk.gray(`├─ ${plan.accounts.length} comptes`));

  await dataSource.transaction((manager) => writePlan(manager, plan));

  const payments = plan.events.filter((event) => event.kind === 'payment');
  console.log(
    chalk.gray(
      `├─ ${plan.partners.length} partenaires, ${plan.employers.length} employeurs, ${plan.wallets.length} portefeuilles`,
    ),
  );
  console.log(
    chalk.gray(
      `└─ ${plan.events.length - payments.length} abondements versés, ${payments.length} transactions`,
    ),
  );

  const transactions = new TransactionService(
    new TransactionRepo(dataSource.getRepository(Payment)),
  );
  const csv = await transactions.exportCsv();
  mkdirSync(EXPORT_DIRECTORY, { recursive: true });
  const csvPath = join(EXPORT_DIRECTORY, TRANSACTIONS_CSV_FILENAME);
  writeFileSync(csvPath, csv, 'utf8');

  await dataSource.destroy();
  await authOptions.database.end();

  const { summary } = plan;
  const activePartners = plan.partners.filter(
    (partner) => partner.status === PartnerStatus.ACTIVE,
  ).length;
  const pendingPartners = plan.partners.filter(
    (partner) => partner.status === PartnerStatus.PENDING,
  ).length;
  const demoEmployee = plan.wallets[0].employee;
  const demoPartner = PARTNERS.find(
    (partner) => partner.tradeName === 'KostumParty',
  );

  console.log('');
  console.log(chalk.bold.green('Base chargée!'));
  console.log(
    chalk.gray('├─ Graine : ') +
      chalk.white(
        `${SEED_RANDOM_SEED} · référence ${formatDay(SEED_REFERENCE_DATE)} · fenêtre ${TRANSACTION_WINDOW_DAYS} jours`,
      ),
  );
  console.log(
    chalk.gray('├─ Partenaires : ') +
      chalk.white(
        `${activePartners} actifs, ${pendingPartners} en attente, ${plan.partners.length - activePartners - pendingPartners} refusé · ${summary.partnersByCategory.size} catégories · ${summary.partnersByRegion.size} régions`,
      ),
  );
  console.log(
    chalk.gray('├─ Transactions : ') +
      chalk.white(
        `${payments.length - summary.refusedTransactions} validées, ${summary.refusedTransactions} refusées pour solde insuffisant`,
      ),
  );
  console.log(
    chalk.gray('├─ Soldes : ') +
      chalk.white(
        `${summary.zeroBalances} à zéro, ${summary.lowBalances} sous 5 €, ${summary.negativeBalances} en découvert · min ${formatEuros(summary.minBalanceCents)} · max ${formatEuros(summary.maxBalanceCents)}`,
      ),
  );
  console.log(
    chalk.gray('├─ CSV : ') +
      chalk.white(`${csvPath} (${csv.split('\n').length - 1} lignes)`),
  );
  console.log(
    chalk.gray('├─ Mot de passe commun : ') + chalk.white(SEED_PASSWORD),
  );
  console.log(
    chalk.gray('│  ') + chalk.white(`${DEMO_ADMIN.email} (administration)`),
  );
  console.log(
    chalk.gray('│  ') +
      chalk.white(`${demoEmployee.email} (salariée, ${EMPLOYERS[0].name})`),
  );
  if (demoPartner) {
    console.log(
      chalk.gray('│  ') +
        chalk.white(`${demoPartner.owner.email} (partenaire)`),
    );
  }
  printCase(summary.zeroCase);
  console.log('');
} catch (error) {
  await authOptions.database.end().catch(() => undefined);
  await fail(dataSource, 'Erreur lors du chargement des données.', error);
}
