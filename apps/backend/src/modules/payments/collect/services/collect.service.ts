import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { PartnerService } from '@/modules/partners/core';
import type { Payment } from '@/modules/payments/core/entities/payment.entity';
import { PaymentTokenService } from '@/modules/payments/payment-token/services/payment-token.service';
import { WalletService } from '@/modules/wallets';
import type { CollectInput, CollectResult } from '../collect.contract';
import { PaymentRepo } from '../repos/payment.repo';

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
   * Collects a payment for a partner: resolves the token (QR signature or
   * short code), then — in one transaction — re-verifies it under lock,
   * debits the wallet and records the payment. A mid-transaction failure
   * leaves neither the token nor the balance touched. Replaying an
   * already-consumed token returns the payment it already produced, without
   * a second debit.
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
          // Invariant violation: a token only turns `consumed` in the same
          // transaction that creates its payment. Never expected in practice.
          throw new InternalServerErrorException(
            ERROR_CODES.PAYMENT_TOKEN_CONSUMED,
          );
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

  private toResult(payment: Payment): CollectResult {
    return {
      paymentId: payment.id,
      amount: payment.amount.toString(),
      partnerReference: payment.partnerReference,
      createdAt: payment.createdAt,
    };
  }
}
