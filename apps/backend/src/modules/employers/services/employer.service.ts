import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import {
  InvalidCursorError,
  paginate,
  type CursorPage,
  type PaginationQueryDto,
} from '@/common/pagination';
import { UserService } from '@/modules/user';
import { WalletService } from '@/modules/wallets';
import { Employer } from '../entities/employer.entity';
import { EmployerRepo } from '../repos/employer.repo';
import { isUniqueViolation } from './helpers/unique-violation.helper';
import type {
  CreateEmployerDto,
  EmployerResponseDto,
} from '../validators/employer.dto';

@Injectable()
export class EmployerService {
  constructor(
    private readonly employerRepo: EmployerRepo,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  async findByIdOrThrow(id: string): Promise<Employer> {
    const employer = await this.employerRepo.findById(id);

    if (!employer) {
      throw new NotFoundException(ERROR_CODES.EMPLOYER_NOT_FOUND);
    }

    return employer;
  }

  async list(
    query: PaginationQueryDto,
  ): Promise<CursorPage<EmployerResponseDto>> {
    let employers: Employer[];
    try {
      employers = await this.employerRepo.findPage(query);
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const page = paginate<Employer>(employers, query.limit);
    const counts = await this.walletService.countActiveByEmployer(
      page.items.map((employer) => employer.id),
    );

    return {
      ...page,
      items: page.items.map((employer) =>
        toResponse(employer, counts.get(employer.id) ?? 0),
      ),
    };
  }

  async create(dto: CreateEmployerDto): Promise<EmployerResponseDto> {
    const owner = await this.userService.findById(dto.ownerId);

    if (!owner) {
      throw new NotFoundException(ERROR_CODES.EMPLOYER_OWNER_NOT_FOUND);
    }

    await this.refuseIfConflicting(dto);

    try {
      const employer = await this.employerRepo.create({
        ownerId: dto.ownerId,
        name: dto.name,
        siren: dto.siren,
      });

      return toResponse(employer, 0);
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
      await this.refuseIfConflicting(dto);
      throw error;
    }
  }

  /**
   * Answers 409 naming the rule that was broken, and returns quietly when
   * none is. Reading before the insert covers the ordinary case; the same
   * read runs again on a unique violation, which is what turns a creation
   * that lost a race into the answer it would have had a moment earlier.
   */
  private async refuseIfConflicting(dto: CreateEmployerDto): Promise<void> {
    const conflicting = await this.employerRepo.findConflicting(
      dto.siren,
      dto.ownerId,
    );

    if (!conflicting) {
      return;
    }

    throw new ConflictException(
      conflicting.siren === dto.siren
        ? ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED
        : ERROR_CODES.EMPLOYER_OWNER_ALREADY_ASSIGNED,
    );
  }
}

function toResponse(
  employer: Employer,
  activeWalletCount: number,
): EmployerResponseDto {
  return {
    id: employer.id,
    name: employer.name,
    siren: employer.siren,
    ownerId: employer.owner.id,
    activeWalletCount,
    createdAt: employer.createdAt,
  };
}
