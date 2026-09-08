import {
  BadRequestException,
  ConflictException,
  GoneException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import type { EntityManager } from 'typeorm';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import type { Env } from '@/config/env/env.schema';
import { PaymentTokenStatus } from '@/modules/payments/core/enums';
import {
  PAYMENT_TOKEN_SOURCE,
  type PaymentTokenCollectOutcome,
  type PaymentTokenLookup,
  type PaymentTokenSource,
  type ResolvedPaymentToken,
} from '../payment-token.contract';
import { PaymentTokenRepo } from '../repos/payment-token.repo';
import { PaymentTokenResponseDto } from '../validators';
import {
  PaymentTokenExpiredError,
  PaymentTokenSignatureInvalidError,
  PaymentTokenUnsupportedVersionError,
} from './helpers/payment-token-signer.errors';
import { verifyPaymentToken } from './helpers/payment-token-signer.helper';

@Injectable()
export class PaymentTokenService {
  constructor(
    @Inject(PAYMENT_TOKEN_SOURCE)
    private readonly paymentTokenSource: PaymentTokenSource,
    private readonly paymentTokenRepo: PaymentTokenRepo,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async issue(userId: string): Promise<PaymentTokenResponseDto> {
    return plainToInstance(
      PaymentTokenResponseDto,
      await this.paymentTokenSource.issue(userId),
    );
  }

  async getCurrent(userId: string): Promise<PaymentTokenResponseDto> {
    return plainToInstance(
      PaymentTokenResponseDto,
      await this.paymentTokenSource.getCurrent(userId),
    );
  }

  async revokeCurrent(userId: string): Promise<void> {
    return this.paymentTokenSource.revokeCurrent(userId);
  }

  /**
   * Resolves a scan or a short code to the live token behind it, before any
   * transaction opens. A QR carries no token id, only signed wallet claims —
   * finding the token still means reading the wallet's current live one.
   */
  async resolveLive(lookup: PaymentTokenLookup): Promise<ResolvedPaymentToken> {
    if ('shortCode' in lookup) {
      const token = await this.paymentTokenRepo.findLiveByShortCode(
        lookup.shortCode,
      );
      if (!token) {
        throw new BadRequestException(ERROR_CODES.PAYMENT_TOKEN_INVALID);
      }
      return { tokenId: token.id, walletId: token.wallet.id };
    }

    const walletId = this.verifyWalletId(lookup.qrPayload);
    const token = await this.paymentTokenRepo.findLiveByWalletId(walletId);
    if (!token) {
      throw new BadRequestException(ERROR_CODES.PAYMENT_TOKEN_INVALID);
    }
    return { tokenId: token.id, walletId };
  }

  /**
   * Re-verifies a resolved token under lock and consumes it. Must run inside
   * the caller's transaction: a mid-transaction failure after this call rolls
   * the consumption back along with everything else, which is what lets an
   * unconditional early consume be safe here.
   */
  async lockAndConsume(
    manager: EntityManager,
    tokenId: string,
  ): Promise<PaymentTokenCollectOutcome> {
    const token = await this.paymentTokenRepo.lockById(manager, tokenId);

    if (!token) {
      throw new BadRequestException(ERROR_CODES.PAYMENT_TOKEN_INVALID);
    }
    if (token.status === PaymentTokenStatus.CONSUMED) {
      return { status: 'already-consumed' };
    }
    if (token.status === PaymentTokenStatus.REVOKED) {
      throw new ConflictException(ERROR_CODES.PAYMENT_TOKEN_REVOKED);
    }
    if (token.expiresAt.getTime() <= Date.now()) {
      throw new GoneException(ERROR_CODES.PAYMENT_TOKEN_EXPIRED);
    }

    await this.paymentTokenRepo.markConsumed(manager, tokenId, new Date());

    return { status: 'consumed', walletId: token.wallet.id };
  }

  private verifyWalletId(qrPayload: string): string {
    try {
      return verifyPaymentToken(
        qrPayload,
        this.configService.get('PAYMENT_TOKEN_SIGNING_SECRET', {
          infer: true,
        }),
      ).walletId;
    } catch (error) {
      if (error instanceof PaymentTokenExpiredError) {
        throw new GoneException(ERROR_CODES.PAYMENT_TOKEN_EXPIRED);
      }
      if (
        error instanceof PaymentTokenSignatureInvalidError ||
        error instanceof PaymentTokenUnsupportedVersionError
      ) {
        throw new BadRequestException(ERROR_CODES.PAYMENT_TOKEN_INVALID);
      }
      throw error;
    }
  }
}
