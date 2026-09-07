import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { Employer } from '../entities/employer.entity';
import { EmployerRepo } from '../repos/employer.repo';

@Injectable()
export class EmployerService {
  constructor(private readonly employerRepo: EmployerRepo) {}

  async findByIdOrThrow(id: string): Promise<Employer> {
    const employer = await this.employerRepo.findById(id);

    if (!employer) {
      throw new NotFoundException(ERROR_CODES.EMPLOYER_NOT_FOUND);
    }

    return employer;
  }
}
