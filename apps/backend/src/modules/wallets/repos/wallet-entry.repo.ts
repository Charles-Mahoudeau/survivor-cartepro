import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { decodeCursor, type PaginationQueryDto } from '@/common/pagination';
import { WalletEntry } from '../entities/wallet-entry.entity';
import type { WalletEntryDirection } from '../enums/wallet-entry-direction.enum';
import type { WalletEntryKind } from '../enums/wallet-entry-kind.enum';

export interface NewWalletEntry {
  wallet: { id: string };
  direction: WalletEntryDirection;
  amount: number;
  balanceAfter: number;
  kind: WalletEntryKind;
  allocation: { id: string };
}

@Injectable()
export class WalletEntryRepo {
  constructor(
    @InjectRepository(WalletEntry)
    private readonly repo: Repository<WalletEntry>,
  ) {}

  findPageForWallet(
    walletId: string,
    query: PaginationQueryDto,
  ): Promise<WalletEntry[]> {
    const builder = this.repo
      .createQueryBuilder('entry')
      .innerJoin('entry.wallet', 'wallet')
      .leftJoinAndSelect('entry.payment', 'payment')
      .leftJoinAndSelect('payment.partner', 'partner')
      .leftJoinAndSelect('entry.allocation', 'allocation')
      .where('wallet.id = :walletId', { walletId })
      .orderBy('entry.id', 'DESC')
      .take(query.limit + 1);

    if (query.cursor) {
      builder.andWhere('entry.id < :cursor', {
        cursor: decodeCursor(query.cursor),
      });
    }

    return builder.getMany();
  }

  async insertAll(
    manager: EntityManager,
    entries: NewWalletEntry[],
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    await manager.insert(WalletEntry, entries);
  }

  async findCreditedWalletIds(allocationId: string): Promise<string[]> {
    const entries = await this.repo.find({
      where: { allocation: { id: allocationId } },
      select: { id: true, wallet: { id: true } },
      relations: { wallet: true },
    });

    return entries.map((entry) => entry.wallet.id);
  }
}
