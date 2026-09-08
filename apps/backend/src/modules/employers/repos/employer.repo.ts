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

  findById(id: string): Promise<Employer | null> {
    return this.repo.findOneBy({ id });
  }

  findBySiren(siren: string): Promise<Employer | null> {
    return this.repo.findOneBy({ siren });
  }

  findPage(query: PaginationQueryDto): Promise<Employer[]> {
    const builder = this.repo
      .createQueryBuilder('employer')
      .orderBy('employer.id', 'DESC')
      .take(query.limit + 1);

    if (query.cursor) {
      builder.andWhere('employer.id < :cursor', {
        cursor: decodeCursor(query.cursor),
      });
    }

    return builder.getMany();
  }

  create(data: { name: string; siren: string }): Promise<Employer> {
    return this.repo.save(
      this.repo.create({ name: data.name, siren: data.siren }),
    );
  }
}
