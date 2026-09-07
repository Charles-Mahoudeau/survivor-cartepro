import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentToken } from '../../core/entities';
import { PaymentTokenStatus } from '../../core/enums';
import { generateUniqueShortCode } from '../services/helpers';

@Injectable()
export class PaymentTokenRepo {
  constructor(
    @InjectRepository(PaymentToken)
    private readonly repo: Repository<PaymentToken>,
    private readonly dataSource: DataSource,
  ) {}

  findLiveByWalletId(walletId: string): Promise<PaymentToken | null> {
    return this.repo.findOne({
      where: { wallet: { id: walletId }, status: PaymentTokenStatus.LIVE },
    });
  }

  /**
   * Revokes the wallet's previous live token and creates the new one in the
   * same transaction, so a reader never observes two live tokens at once.
   */
  async issueNewToken(
    walletId: string,
    expiresAt: Date,
  ): Promise<PaymentToken> {
    const token = await this.dataSource.transaction(async (manager) => {
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
}
