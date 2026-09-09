import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { toCents, toEuros } from '@/common/money';
import { PartnerService } from '@/modules/partners/core';
import type { Payment } from '@/modules/payments/core/entities/payment.entity';
import { PaymentTokenService } from '@/modules/payments/payment-token/services/payment-token.service';
import { WalletService } from '@/modules/wallets';
import type { CollectInput, CollectResult } from '../collect.contract';
import { PaymentRepo } from '../repos/payment.repo';
import { readPaymentCredential } from './helpers';
import type { CollectPaymentDto } from '../validators';

@Injectable()
export class CollectService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly paymentTokenService: PaymentTokenService,
    private readonly partnerService: PartnerService,
    private readonly walletService: WalletService,
    private readonly paymentRepo: PaymentRepo,
  ) {}

  /**
   * Collects for the partner the connected account owns. The partner identity
   * comes from the session and the capture mode from which credential the body
   * carried, so neither is a value a caller can choose.
   */
  async collectForOwner(
    ownerId: string,
    dto: CollectPaymentDto,
  ): Promise<CollectResult> {
    const partnerId = await this.partnerService.getActiveIdByOwnerId(ownerId);
    const { lookup, captureMode } = readPaymentCredential(dto);

    return this.collect({
      lookup,
      partnerId,
      captureMode,
      amount: dto.amount,
      partnerReference: dto.partnerReference ?? null,
    });
  }

  /**
   * Collects a payment for a partner: resolves the token (QR signature or
   * short code), then — in one transaction — re-verifies it under lock,
   * debits the wallet and records the payment. A mid-transaction failure
   * leaves neither the token nor the balance touched. A partner replaying its
   * own request for the same amount gets the payment it already produced,
   * without a second debit; any other caller of a spent token is refused
   * rather than handed a payment that is not theirs.
   */
  async collect(input: CollectInput): Promise<CollectResult> {
    const { tokenId } = await this.paymentTokenService.resolveLive(
      input.lookup,
    );

    const payment = await this.dataSource.transaction(async (manager) => {
      await this.partnerService.assertActive(input.partnerId);

      const outcome = await this.paymentTokenService.lockAndConsume(
        manager,
        tokenId,
      );

      if (outcome.status === 'already-consumed') {
        const existing = await this.paymentRepo.findByTokenId(tokenId, manager);
        if (!existing) {
          throw new InternalServerErrorException(
            ERROR_CODES.PAYMENT_TOKEN_CONSUMED,
          );
        }
        if (!this.replays(existing, input)) {
          throw new ConflictException(ERROR_CODES.PAYMENT_TOKEN_ALREADY_USED);
        }
        return existing;
      }

      const created = await this.paymentRepo.create(
        {
          walletId: outcome.walletId,
          partnerId: input.partnerId,
          paymentTokenId: tokenId,
          amount: input.amount,
          captureMode: input.captureMode,
          partnerReference: input.partnerReference,
        },
        manager,
      );

      await this.walletService.debitForPayment(manager, {
        walletId: outcome.walletId,
        amount: input.amount,
        paymentId: created.id,
      });

      return created;
    });

    return this.toResult(payment);
  }

  /**
   * Whether the settled payment is the one this request is asking for again.
   * Two tills can race the same live token; the loser must not be told the
   * winner's payment is its own.
   */
  private replays(payment: Payment, input: CollectInput): boolean {
    return (
      payment.partner.id === input.partnerId &&
      toCents(Number(payment.amount)) === toCents(input.amount)
    );
  }

  /**
   * A freshly saved row still holds the number that was inserted, while one
   * read back holds the `numeric` Postgres returns. Formatting rather than
   * stringifying is what keeps both paths answering `12.50`.
   */
  private toResult(payment: Payment): CollectResult {
    return {
      paymentId: payment.id,
      amount: toEuros(toCents(Number(payment.amount))),
      partnerReference: payment.partnerReference,
      createdAt: payment.createdAt,
    };
  }
}
