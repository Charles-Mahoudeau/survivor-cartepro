import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { PaymentToken } from '../../core/entities';
import { PaymentTokenStatus } from '../../core/enums';
import { generateUniqueShortCode } from '../services/helpers';

@Injectable()
export class PaymentTokenRepo {
  constructor(
    @InjectRepository(PaymentToken)
    private readonly repo: Repository<PaymentToken>,
  ) {}

  findLiveByWalletId(walletId: string): Promise<PaymentToken | null> {
    return this.repo.findOne({
      where: {
        wallet: { id: walletId },
        status: PaymentTokenStatus.LIVE,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async revokeLiveByWalletId(walletId: string): Promise<boolean> {
    const result = await this.repo.update(
      { wallet: { id: walletId }, status: PaymentTokenStatus.LIVE },
      { status: PaymentTokenStatus.REVOKED },
    );

    return (result.affected ?? 0) > 0;
  }

  /**
   * Revokes the wallet's previous live token and creates the new one in the
   * same transaction, so a reader never observes two live tokens at once.
   */
  async issueNewToken(
    walletId: string,
    expiresAt: Date,
  ): Promise<PaymentToken> {
    const token = await this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(PaymentToken);

      await repo.update(
        { wallet: { id: walletId }, status: PaymentTokenStatus.LIVE },
        { status: PaymentTokenStatus.REVOKED },
      );

      const shortCode = await generateUniqueShortCode((code) =>
        repo.exists({
          where: { shortCode: code, status: PaymentTokenStatus.LIVE },
        }),
      );

      return repo.save({
        wallet: { id: walletId },
        status: PaymentTokenStatus.LIVE,
        shortCode,
        expiresAt,
      });
    });

    return token;
  }

  /** The live token for a short code — `null` covers unknown, stale and already-superseded codes alike. */
  findLiveByShortCode(shortCode: string): Promise<PaymentToken | null> {
    return this.repo.findOne({
      where: { shortCode, status: PaymentTokenStatus.LIVE },
      relations: { wallet: true },
    });
  }

  /**
   * Re-reads a token under a lock held until the transaction ends, so the
   * collection service verifies its live/expiry state against the row
   * nothing else can be changing underneath it right now.
   */
  lockById(manager: EntityManager, id: string): Promise<PaymentToken | null> {
    return manager
      .createQueryBuilder(PaymentToken, 'token')
      .select(['token.id', 'token.status', 'token.expiresAt'])
      .innerJoin('token.wallet', 'wallet')
      .addSelect(['wallet.id'])
      .where('token.id = :id', { id })
      .setLock('pessimistic_write', undefined, ['token'])
      .getOne();
  }

  /**
   * Flips a live token to consumed. The `status = live` guard is redundant
   * with the caller already holding it locked, kept as self-documentation of
   * the only legal transition.
   */
  async markConsumed(
    manager: EntityManager,
    id: string,
    consumedAt: Date,
  ): Promise<boolean> {
    const result = await manager.update(
      PaymentToken,
      { id, status: PaymentTokenStatus.LIVE },
      { status: PaymentTokenStatus.CONSUMED, consumedAt },
    );

    return (result.affected ?? 0) > 0;
  }

  async updateExpiredTokens(): Promise<void> {
    await this.repo.update(
      {
        status: PaymentTokenStatus.LIVE,
        expiresAt: LessThan(new Date()),
      },
      { status: PaymentTokenStatus.REVOKED },
    );
  }
}
