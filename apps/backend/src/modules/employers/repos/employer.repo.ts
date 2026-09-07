import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employer } from '../entities';

@Injectable()
export class EmployerRepo {
  constructor(
    @InjectRepository(Employer) private readonly repo: Repository<Employer>,
  ) {}

  findById(id: string): Promise<Employer | null> {
    return this.repo.findOne({ where: { id } });
  }
}
