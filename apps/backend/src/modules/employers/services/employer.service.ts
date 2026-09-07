import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
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

    const conflicting = await this.employerRepo.findConflicting(
      dto.siren,
      dto.ownerId,
    );

    if (conflicting) {
      throw new UnprocessableEntityException(
        conflicting.siren === dto.siren
          ? ERROR_CODES.EMPLOYER_SIREN_ALREADY_USED
          : ERROR_CODES.EMPLOYER_OWNER_ALREADY_ASSIGNED,
      );
    }

    const employer = await this.employerRepo.create({
      ownerId: dto.ownerId,
      name: dto.name,
      siren: dto.siren,
    });

    return toResponse(employer, 0);
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
