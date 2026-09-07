import { Injectable } from '@nestjs/common';
import type { Employer } from '../entities';
import { EmployerRepo } from '../repos/employer.repo';

@Injectable()
export class EmployerService {
  constructor(private readonly employerRepo: EmployerRepo) {}

  findById(id: string): Promise<Employer | null> {
    return this.employerRepo.findById(id);
  }
}
