import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import type { Env } from '@/config/env/env.schema';
import type { PaymentToken } from '@/modules/payments/core/entities';
import { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';
import { WalletService } from '@/modules/wallets/services/wallet.service';
import { CURRENT_PAYMENT_TOKEN_VERSION } from '../../constants/payment-token.constants';
import type {
  PaymentTokenPayload,
  PaymentTokenSource,
} from '../../payment-token.contract';
import { PaymentTokenRepo } from '../../repos/payment-token.repo';
import {
  capPaymentTokenTtlSeconds,
  signPaymentToken,
} from './payment-token-signer.helper';

@Injectable()
export class SignedPaymentTokenService implements PaymentTokenSource {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentTokenRepo: PaymentTokenRepo,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async issue(userId: string): Promise<PaymentTokenPayload> {
    const wallet = await this.walletService.findSummaryByUserId(userId);

    if (wallet.status === WalletStatus.DISABLED) {
      throw new ForbiddenException(ERROR_CODES.ACCOUNT_BANNED);
    }
    if (Number(wallet.balance) <= 0) {
      throw new UnprocessableEntityException(ERROR_CODES.EMPTY_BALANCE);
    }

    const ttlSeconds = capPaymentTokenTtlSeconds(
      this.configService.get('PAYMENT_TOKEN_TTL_SECONDS', { infer: true }),
    );
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const paymentToken = await this.paymentTokenRepo.issueNewToken(
      wallet.id,
      expiresAt,
    );

    return this.toPayload(paymentToken, userId, wallet.id);
  }

  async getCurrent(userId: string): Promise<PaymentTokenPayload> {
    const wallet = await this.walletService.findSummaryByUserId(userId);

    const paymentToken = await this.paymentTokenRepo.findLiveByWalletId(
      wallet.id,
    );
    if (!paymentToken) {
      throw new NotFoundException(ERROR_CODES.PAYMENT_TOKEN_NOT_FOUND);
    }

    return this.toPayload(paymentToken, userId, wallet.id);
  }

  private toPayload(
    paymentToken: PaymentToken,
    userId: string,
    walletId: string,
  ): PaymentTokenPayload {
    const expiresAt = paymentToken.expiresAt.toISOString();
    const qrPayload = signPaymentToken(
      { userId, walletId, expiresAt, version: CURRENT_PAYMENT_TOKEN_VERSION },
      this.configService.get('PAYMENT_TOKEN_SIGNING_SECRET', {
        infer: true,
      }),
    );

    return {
      token: paymentToken.id,
      qrPayload,
      shortCode: paymentToken.shortCode,
      expiresAt,
    };
  }
}
