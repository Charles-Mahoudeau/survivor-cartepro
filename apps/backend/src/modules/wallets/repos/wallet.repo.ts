import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletStatus } from '../enums/wallet-status.enum';

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
  ): Promise<Pick<Wallet, 'id' | 'status' | 'balance' | 'currency'> | null> {
    return this.repo.findOne({
      where: { user: { id: userId } },
      select: { id: true, status: true, balance: true, currency: true },
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

  /**
   * Reads a single wallet under a lock held until the transaction ends, so a
   * concurrent debit on the same wallet queues behind this one instead of
   * racing its balance check.
   */
  lockById(
    manager: EntityManager,
    id: string,
  ): Promise<Pick<Wallet, 'id' | 'balance' | 'status'> | null> {
    return manager
      .createQueryBuilder(Wallet, 'wallet')
      .select(['wallet.id', 'wallet.balance', 'wallet.status'])
      .where('wallet.id = :id', { id })
      .setLock('pessimistic_write')
      .getOne();
  }

  debitById(
    manager: EntityManager,
    walletId: string,
    amount: number,
  ): Promise<unknown> {
    return manager
      .createQueryBuilder()
      .update(Wallet)
      .set({ balance: () => 'balance - :amount' })
      .where('id = :walletId', { walletId })
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
