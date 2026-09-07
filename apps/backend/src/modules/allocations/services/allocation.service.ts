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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmployerService } from '@/modules/employers';
import { WalletStatus } from '@/modules/wallets/enums/wallet-status.enum';
import { WalletService, type EmployerWallet } from '@/modules/wallets';
import { Allocation } from '../entities/allocation.entity';
import { AllocationExclusionReason } from '../enums/allocation-exclusion-reason.enum';
import { AllocationStatus } from '../enums/allocation-status.enum';
import { AllocationRepo } from '../repos/allocation.repo';
import { totalCredited } from './helpers/total.helper';
import type {
  AllocationAppliedResponseDto,
  AllocationBeneficiaryDto,
  AllocationDetailResponseDto,
  AllocationExcludedDto,
  AllocationResponseDto,
  CreateAllocationDto,
  UpdateAllocationDto,
} from '../validators/allocation.dto';

@Injectable()
export class AllocationService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly allocationRepo: AllocationRepo,
    private readonly employerService: EmployerService,
    private readonly walletService: WalletService,
  ) {}

  async list(
    query: PaginationQueryDto,
  ): Promise<CursorPage<AllocationResponseDto>> {
    let allocations: Allocation[];
    try {
      allocations = await this.allocationRepo.findPage(query);
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const page = paginate<Allocation>(allocations, query.limit);

    return {
      ...page,
      items: page.items.map((allocation) => this.toResponse(allocation)),
    };
  }

  async create(
    dto: CreateAllocationDto,
    agentId: string,
  ): Promise<AllocationResponseDto> {
    const employer = await this.employerService.findByIdOrThrow(dto.employerId);
    const allocation = await this.allocationRepo.create({
      employerId: employer.id,
      label: dto.label,
      amount: dto.amount,
      createdById: agentId,
    });
    allocation.employer = employer;

    return this.toResponse(allocation);
  }

  async findById(id: string): Promise<AllocationDetailResponseDto> {
    return this.toDetailResponse(await this.findOrThrow(id));
  }

  async update(
    id: string,
    dto: UpdateAllocationDto,
  ): Promise<AllocationDetailResponseDto> {
    const allocation = await this.findOrThrow(id);
    this.refuseApplied(allocation);

    const changes: { label?: string; amount?: number } = {};
    if (dto.label !== undefined) {
      changes.label = dto.label;
    }
    if (dto.amount !== undefined) {
      changes.amount = dto.amount;
    }

    if (Object.keys(changes).length > 0) {
      if (!(await this.allocationRepo.updateDraft(id, changes))) {
        throw new ConflictException(ERROR_CODES.ALLOCATION_ALREADY_APPLIED);
      }
      Object.assign(allocation, changes);
    }

    return this.toDetailResponse(allocation);
  }

  /**
   * Credits every active wallet of the employer, in one transaction: the
   * movements, the balances and the status of the allocation land together or
   * not at all. A second call finds the allocation applied and answers 409.
   */
  async apply(id: string): Promise<AllocationAppliedResponseDto> {
    const allocation = await this.findOrThrow(id);
    this.refuseApplied(allocation);

    const appliedAt = new Date();
    const { amount, outcome } = await this.dataSource.transaction(
      async (manager) => {
        const locked = await this.allocationRepo.lockById(manager, id);

        if (!locked) {
          throw new NotFoundException(ERROR_CODES.ALLOCATION_NOT_FOUND);
        }
        if (locked.status === AllocationStatus.APPLIED) {
          throw new ConflictException(ERROR_CODES.ALLOCATION_ALREADY_APPLIED);
        }

        const credited = await this.walletService.creditFromAllocation(
          manager,
          {
            allocationId: locked.id,
            employerId: allocation.employer.id,
            amount: Number(locked.amount),
          },
        );
        await this.allocationRepo.markApplied(manager, id, appliedAt);

        return { amount: locked.amount, outcome: credited };
      },
    );

    return {
      id: allocation.id,
      status: AllocationStatus.APPLIED,
      appliedAt,
      creditedCount: outcome.credited.length,
      total: totalCredited(String(amount), outcome.credited.length),
      excluded: outcome.excluded.map((wallet) => ({
        ...toHolder(wallet),
        reason: AllocationExclusionReason.WALLET_DISABLED,
      })),
    };
  }

  private refuseApplied(allocation: Allocation): void {
    if (allocation.status === AllocationStatus.APPLIED) {
      throw new ConflictException(ERROR_CODES.ALLOCATION_ALREADY_APPLIED);
    }
  }

  private async findOrThrow(id: string): Promise<Allocation> {
    const allocation = await this.allocationRepo.findById(id);

    if (!allocation) {
      throw new NotFoundException(ERROR_CODES.ALLOCATION_NOT_FOUND);
    }

    return allocation;
  }

  private async toDetailResponse(
    allocation: Allocation,
  ): Promise<AllocationDetailResponseDto> {
    const wallets = await this.walletService.listByEmployer(
      allocation.employer.id,
    );
    const isCredited = await this.buildCreditPredicate(allocation);

    const beneficiaries: AllocationBeneficiaryDto[] = [];
    const excluded: AllocationExcludedDto[] = [];

    for (const wallet of wallets) {
      const holder = toHolder(wallet);
      if (isCredited(wallet)) {
        beneficiaries.push(holder);
      } else {
        excluded.push({
          ...holder,
          reason: AllocationExclusionReason.WALLET_DISABLED,
        });
      }
    }

    return {
      ...this.toResponse(allocation),
      beneficiaries,
      excluded,
      total: totalCredited(String(allocation.amount), beneficiaries.length),
    };
  }

  /**
   * A draft answers with the wallets it would credit; an applied allocation
   * answers with the ones it did, so a wallet disabled since does not turn a
   * past credit into an exclusion.
   */
  private async buildCreditPredicate(
    allocation: Allocation,
  ): Promise<(wallet: EmployerWallet) => boolean> {
    if (allocation.status !== AllocationStatus.APPLIED) {
      return (wallet) => wallet.status === WalletStatus.ACTIVE;
    }

    const credited = new Set(
      await this.walletService.listWalletIdsCreditedBy(allocation.id),
    );

    return (wallet) => credited.has(wallet.id);
  }

  private toResponse(allocation: Allocation): AllocationResponseDto {
    return {
      id: allocation.id,
      employerId: allocation.employer.id,
      employerName: allocation.employer.name,
      label: allocation.label,
      amount: Number(allocation.amount).toFixed(2),
      status: allocation.status,
      appliedAt: allocation.appliedAt ?? null,
      createdAt: allocation.createdAt,
    };
  }
}

function toHolder(wallet: EmployerWallet): AllocationBeneficiaryDto {
  return {
    walletId: wallet.id,
    employeeRef: wallet.employeeRef,
    holderName: wallet.holderName,
  };
}
