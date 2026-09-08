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

  /**
   * The wallets of an employer, locked for the rest of the transaction so a
   * status or a balance cannot move while an allocation is being applied.
   * `FOR UPDATE OF wallet` leaves the joined holder row untouched.
   */
  lockByEmployerId(
    manager: EntityManager,
    employerId: string,
  ): Promise<Wallet[]> {
    return manager
      .createQueryBuilder(Wallet, 'wallet')
      .select([
        'wallet.id',
        'wallet.employeeRef',
        'wallet.balance',
        'wallet.status',
      ])
      .innerJoin('wallet.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .where('wallet.employer = :employerId', { employerId })
      .orderBy('wallet.id', 'ASC')
      .setLock('pessimistic_write', undefined, ['wallet'])
      .getMany();
  }

  creditAll(
    manager: EntityManager,
    walletIds: string[],
    amount: number,
  ): Promise<unknown> {
    return manager
      .createQueryBuilder()
      .update(Wallet)
      .set({ balance: () => 'balance + :amount' })
      .where('id IN (:...walletIds)', { walletIds })
      .setParameter('amount', amount)
      .execute();
  }

  findByEmployerId(employerId: string): Promise<Wallet[]> {
    return this.repo.find({
      where: { employer: { id: employerId } },
      select: {
        id: true,
        employeeRef: true,
        status: true,
        user: { id: true, name: true },
      },
      relations: { user: true },
      order: { id: 'ASC' },
    });
  }
}
