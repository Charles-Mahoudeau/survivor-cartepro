import { ROLES } from '@/config/auth/auth.constants';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import { PartnerFixture } from '@/modules/partners/core/specs/partner.fixture';
import type { TestApp } from '../../../../../test/app';
import {
  grantRole,
  signUp,
  type SignedUpAccount,
} from '../../../../../test/fixtures/user.fixture';
import { createWallet } from '../../../../../test/fixtures/wallet.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import type { PaymentTokenResponseDto } from '../../payment-token/validators';

/** The account that presents a token, and the wallet a collection debits. */
export interface Employee {
  account: SignedUpAccount;
  walletId: string;
}

/** The account that calls the till route, and the partner it collects for. */
export interface CollectingPartner {
  account: SignedUpAccount;
  partnerId: string;
}

let fixtureSequence = 0;

function uniqueEmail(prefix: string): string {
  return `collect-${prefix}-${++fixtureSequence}-${Date.now()}@tickettout.test`;
}

/** The two sides of a collection, each signed up through the real routes. */
export class CollectPaymentFixture {
  static async signUpEmployee(
    context: TestApp,
    balance: number,
  ): Promise<Employee> {
    const account = await signUp(context.app, uniqueEmail('employee'));
    const wallet = await createWallet(context.dataSource, account.id, {
      balance,
    });

    return { account, walletId: wallet.id };
  }

  static async signUpPartner(
    context: TestApp,
    status: PartnerStatus = PartnerStatus.ACTIVE,
  ): Promise<CollectingPartner> {
    const account = await signUp(context.app, uniqueEmail('partner'));
    const partner = await PartnerFixture.create(
      context.dataSource,
      account.id,
      {
        status,
      },
    );
    await grantRole(context, account.id, ROLES.PARTNER);

    return { account, partnerId: partner.id };
  }

  /** Goes through the employee's own route, so the QR under test is a real one. */
  static async issueToken(
    context: TestApp,
    employee: Employee,
  ): Promise<PaymentTokenResponseDto> {
    return bodyOf<PaymentTokenResponseDto>(
      await api(context.app)
        .post(apiPath('/me/payment-tokens'))
        .set('Cookie', employee.account.cookie)
        .expect(201),
    );
  }
}
