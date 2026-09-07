import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { decodeCursor, type PaginationQueryDto } from '@/common/pagination';
import { Allocation } from '../entities/allocation.entity';

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

  async updateDraft(
    id: string,
    changes: { label?: string; amount?: number },
  ): Promise<void> {
    await this.repo.update({ id }, changes);
  }
}
