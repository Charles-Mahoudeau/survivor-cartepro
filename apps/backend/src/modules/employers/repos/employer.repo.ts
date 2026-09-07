import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { decodeCursor, type PaginationQueryDto } from '@/common/pagination';
import { Employer } from '../entities/employer.entity';

@Injectable()
export class EmployerRepo {
  constructor(
    @InjectRepository(Employer)
    private readonly repo: Repository<Employer>,
  ) {}

  findPage(query: PaginationQueryDto): Promise<Employer[]> {
    const builder = this.repo
      .createQueryBuilder('employer')
      .innerJoin('employer.owner', 'owner')
      .addSelect('owner.id')
      .orderBy('employer.id', 'DESC')
      .take(query.limit + 1);

    if (query.cursor) {
      builder.andWhere('employer.id < :cursor', {
        cursor: decodeCursor(query.cursor),
      });
    }

    return builder.getMany();
  }

  /**
   * The row that would collide with a creation, whichever of the two unique
   * rules it breaks, so the caller can name the right one without a second read.
   */
  findConflicting(siren: string, ownerId: string): Promise<Employer | null> {
    return this.repo
      .createQueryBuilder('employer')
      .where('employer.siren = :siren', { siren })
      .orWhere('employer.owner = :ownerId', { ownerId })
      .getOne();
  }

  create(data: {
    ownerId: string;
    name: string;
    siren: string;
  }): Promise<Employer> {
    return this.repo.save(
      this.repo.create({
        owner: { id: data.ownerId },
        name: data.name,
        siren: data.siren,
      }),
    );
  }
}
