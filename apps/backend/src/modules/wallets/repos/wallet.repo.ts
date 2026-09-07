import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletStatus } from '../enums/wallet-status.enum';

@Injectable()
export class WalletRepo {
  constructor(
    @InjectRepository(Wallet) private readonly repo: Repository<Wallet>,
  ) {}

  findByUserId(userId: string): Promise<Wallet | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      relations: { entries: true },
      order: { entries: { createdAt: 'DESC' } },
    });
  }

  findIdByUserId(userId: string): Promise<Pick<Wallet, 'id'> | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      select: { id: true },
    });
  }

  /**
   * How many spendable wallets each of these employers holds, in one grouped
   * read, so a list of employers never counts them employer by employer. An
   * employer with none is absent from the result.
   */
  countActiveByEmployerIds(
    employerIds: string[],
  ): Promise<{ employerId: string; count: string }[]> {
    if (employerIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.repo
      .createQueryBuilder('wallet')
      .select('wallet.employer_id', 'employerId')
      .addSelect('COUNT(*)', 'count')
      .where('wallet.employer_id IN (:...employerIds)', { employerIds })
      .andWhere('wallet.status = :status', { status: WalletStatus.ACTIVE })
      .groupBy('wallet.employer_id')
      .getRawMany<{ employerId: string; count: string }>();
  }
}
