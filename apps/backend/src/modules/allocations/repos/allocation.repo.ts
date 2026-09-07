import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { decodeCursor, type PaginationQueryDto } from '@/common/pagination';
import { Allocation } from '../entities/allocation.entity';
import { AllocationStatus } from '../enums/allocation-status.enum';

@Injectable()
export class AllocationRepo {
  constructor(
    @InjectRepository(Allocation)
    private readonly repo: Repository<Allocation>,
  ) {}

  findPage(query: PaginationQueryDto): Promise<Allocation[]> {
    const builder = this.repo
      .createQueryBuilder('allocation')
      .innerJoinAndSelect('allocation.employer', 'employer')
      .orderBy('allocation.id', 'DESC')
      .take(query.limit + 1);

    if (query.cursor) {
      builder.andWhere('allocation.id < :cursor', {
        cursor: decodeCursor(query.cursor),
      });
    }

    return builder.getMany();
  }

  findById(id: string): Promise<Allocation | null> {
    return this.repo.findOne({
      where: { id },
      relations: { employer: true },
    });
  }

  create(data: {
    employerId: string;
    label: string;
    amount: number;
    createdById: string;
  }): Promise<Allocation> {
    return this.repo.save(
      this.repo.create({
        employer: { id: data.employerId },
        label: data.label,
        amount: data.amount,
        createdBy: { id: data.createdById },
      }),
    );
  }

  /**
   * Amends the row only while it is still a draft, and answers whether it
   * moved. The status sits in the `WHERE`, so an apply committing alongside
   * makes this write miss rather than race it.
   */
  async updateDraft(
    id: string,
    changes: { label?: string; amount?: number },
  ): Promise<boolean> {
    const result = await this.repo.update(
      { id, status: AllocationStatus.DRAFT },
      changes,
    );

    return (result.affected ?? 0) > 0;
  }

  /**
   * Reads the row under a lock held until the transaction ends, so a second
   * apply queues behind the first instead of crediting alongside it. It carries
   * the amount as well: crediting from a copy read before the lock would spend
   * a figure an amendment has since replaced. No join, because Postgres refuses
   * `FOR UPDATE` on the nullable side of one.
   */
  lockById(
    manager: EntityManager,
    id: string,
  ): Promise<Pick<Allocation, 'id' | 'status' | 'amount'> | null> {
    return manager
      .createQueryBuilder(Allocation, 'allocation')
      .select(['allocation.id', 'allocation.status', 'allocation.amount'])
      .where('allocation.id = :id', { id })
      .setLock('pessimistic_write')
      .getOne();
  }

  async markApplied(
    manager: EntityManager,
    id: string,
    appliedAt: Date,
  ): Promise<void> {
    await manager.update(
      Allocation,
      { id },
      { status: AllocationStatus.APPLIED, appliedAt },
    );
  }
}
