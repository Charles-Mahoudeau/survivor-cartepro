import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { decodeCursor, type PaginationQueryDto } from '@/common/pagination';
import type { Period } from '@/common/period';
import { WalletEntry } from '../entities/wallet-entry.entity';

@Injectable()
export class WalletEntryRepo {
  constructor(
    @InjectRepository(WalletEntry)
    private readonly repo: Repository<WalletEntry>,
  ) {}

  findPageForWallet(
    walletId: string,
    query: PaginationQueryDto,
    period: Period,
  ): Promise<WalletEntry[]> {
    const builder = this.repo
      .createQueryBuilder('entry')
      .innerJoin('entry.wallet', 'wallet')
      .leftJoinAndSelect('entry.payment', 'payment')
      .leftJoinAndSelect('payment.partner', 'partner')
      .leftJoinAndSelect('entry.allocation', 'allocation')
      .where('wallet.id = :walletId', { walletId })
      .andWhere('entry.createdAt >= :from', { from: period.from })
      .orderBy('entry.id', 'DESC')
      .take(query.limit + 1);

    if (period.to) {
      builder.andWhere('entry.createdAt <= :to', { to: period.to });
    }

    if (query.cursor) {
      builder.andWhere('entry.id < :cursor', {
        cursor: decodeCursor(query.cursor),
      });
    }

    return builder.getMany();
  }
}
