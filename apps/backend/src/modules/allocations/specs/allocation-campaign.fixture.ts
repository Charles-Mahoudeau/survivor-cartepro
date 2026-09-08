import { ROLES } from '@/config/auth/auth.constants';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';
import { Employer } from '@/modules/employers/entities/employer.entity';
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
import { AllocationFixture } from './allocation.fixture';

/** How many wallets an employer holds, split by whether they can be credited. */
export interface WalletMix {
  active: number;
  disabled: number;
}

/** Everything an allocation needs to exist and to have someone to credit. */
export interface AllocationCampaign {
  agent: SignedUpAccount;
  employer: Employer;
  allocation: Allocation;
  active: Wallet[];
  disabled: Wallet[];
}

let fixtureSequence = 0;

function uniqueEmail(prefix: string): string {
  return `${prefix}-${++fixtureSequence}-${Date.now()}@tickettout.test`;
}

export class AllocationCampaignFixture {
  static async create(
    context: TestApp,
    mix: WalletMix = { active: 0, disabled: 0 },
    overrides: Parameters<typeof AllocationFixture.create>[3] = {},
  ): Promise<AllocationCampaign> {
    const agent = await this.signUpAgent(context);
    const { employer, active, disabled } = await this.seedEmployer(
      context,
      mix,
    );
    const allocation = await AllocationFixture.create(
      context.dataSource,
      employer.id,
      agent.id,
      overrides,
    );

    return { agent, employer, allocation, active, disabled };
  }

  /** An administration account, signed in and ready to call the routes. */
  static async signUpAgent(context: TestApp): Promise<SignedUpAccount> {
    const account = await signUp(context.app, uniqueEmail('agent'));
    await grantRole(context, account.id, ROLES.ADMIN);

    return account;
  }

  /**
   * An employer and its wallets. The holders are written as bare account rows:
   * they never sign in, and signing up a dozen of them trips the rate limit.
   */
  static async seedEmployer(
    context: TestApp,
    { active, disabled }: WalletMix = { active: 0, disabled: 0 },
  ): Promise<{ employer: Employer; active: Wallet[]; disabled: Wallet[] }> {
    const employer = await createEmployer(context.dataSource);
    const seeded = {
      employer,
      active: [] as Wallet[],
      disabled: [] as Wallet[],
    };

    for (let index = 0; index < active + disabled; index++) {
      const holder = await createUser(
        context,
        `Porteur ${index}`,
        uniqueEmail('holder'),
      );
      const isActive = index < active;
      const wallet = await createWallet(context.dataSource, holder.id, {
        employer: { id: employer.id },
        employeeRef: `EMP-${++fixtureSequence}`,
        balance: 0,
        status: isActive ? WalletStatus.ACTIVE : WalletStatus.DISABLED,
      });
      (isActive ? seeded.active : seeded.disabled).push(wallet);
    }

    return seeded;
  }
}
