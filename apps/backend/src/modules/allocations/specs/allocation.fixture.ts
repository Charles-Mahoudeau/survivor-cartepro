import { ROLES } from '@/config/auth/auth.constants';
import type { Employer } from '@/modules/employers/entities/employer.entity';
import { Wallet } from '@/modules/wallets/entities/wallet.entity';
import { WalletStatus } from '@/modules/wallets/enums';
import type { TestApp } from '../../../../test/app';
import { createEmployer } from '../../../../test/fixtures/employer.fixture';
import {
  createUser,
  grantRole,
  signUp,
  type SignedUpAccount,
} from '../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../test/fixtures/wallet.fixture';

/** How many wallets an employer holds, split by whether they can be credited. */
export interface WalletMix {
  active: number;
  disabled: number;
}

export interface SeededEmployer {
  employer: Employer;
  active: Wallet[];
  disabled: Wallet[];
}

let sequence = 0;

function uniqueEmail(prefix: string): string {
  return `${prefix}-${++sequence}-${Date.now()}@tickettout.test`;
}

/** An account of the administration, signed in and ready to call the routes. */
export async function signUpAgent(context: TestApp): Promise<SignedUpAccount> {
  const account = await signUp(context.app, uniqueEmail('agent'));
  await grantRole(context, account.id, ROLES.ADMIN);

  return account;
}

/**
 * An employer and its wallets. The holders are written as bare account rows:
 * they never sign in, and signing up a dozen of them trips the rate limit.
 */
export async function seedEmployerWithWallets(
  context: TestApp,
  ownerId: string,
  { active, disabled }: WalletMix,
): Promise<SeededEmployer> {
  const employer = await createEmployer(context.dataSource, ownerId);
  const seeded: SeededEmployer = { employer, active: [], disabled: [] };

  for (let index = 0; index < active + disabled; index++) {
    const holder = await createUser(
      context,
      `Porteur ${index}`,
      uniqueEmail('holder'),
    );
    const isActive = index < active;
    const wallet = await createWallet(context.dataSource, holder.id, {
      employer: { id: employer.id },
      employeeRef: `EMP-${++sequence}`,
      balance: 0,
      status: isActive ? WalletStatus.ACTIVE : WalletStatus.DISABLED,
    });
    (isActive ? seeded.active : seeded.disabled).push(wallet);
  }

  return seeded;
}

export function readWallets(
  context: TestApp,
  walletIds: string[],
): Promise<Wallet[]> {
  return context.dataSource
    .getRepository(Wallet)
    .find({ where: walletIds.map((id) => ({ id })) });
}

/** Blocks until a backend is queued on a row lock, so no sleep has to guess. */
export async function waitForLockWaiter(
  context: TestApp,
  timeoutMs = 5000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const [{ waiting }] = await context.dataSource.query<{ waiting: number }[]>(
      `SELECT count(*)::int AS waiting FROM pg_stat_activity
       WHERE wait_event_type = 'Lock' AND state = 'active'`,
    );

    if (waiting > 0) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error('no backend ever queued on the allocation row lock');
}
