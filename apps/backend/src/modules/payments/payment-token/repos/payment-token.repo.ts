import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
