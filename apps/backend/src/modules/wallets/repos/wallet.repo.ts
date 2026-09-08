import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class WalletRepo {
  constructor(
    @InjectRepository(Wallet) private readonly repo: Repository<Wallet>,
  ) {}

  /**
   * A personal wallet: `employer`, `balance`, `currency` and `status` are left
   * unset so the entity's own column defaults apply, rather than duplicating
   * that shape here.
   */
  create(userId: string, manager?: EntityManager): Promise<Wallet> {
    const repo = manager ? manager.getRepository(Wallet) : this.repo;
    return repo.save({ user: { id: userId } });
  }

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

  findSummaryByUserId(
    userId: string,
  ): Promise<Pick<Wallet, 'id' | 'status' | 'balance'> | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      select: { id: true, status: true, balance: true },
    });
  }
}
