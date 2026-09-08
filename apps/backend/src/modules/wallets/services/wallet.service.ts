import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  InvalidCursorError,
  paginate,
  type CursorPage,
} from '@/common/pagination';
import {
  InvalidPeriodError,
  resolvePeriod,
  type Period,
  type PeriodQueryDto,
} from '@/common/period';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { toCents, toEuros } from '@/common/money';
import type { EntityManager } from 'typeorm';
import type { Wallet } from '../entities/wallet.entity';
import { WalletEntry } from '../entities/wallet-entry.entity';
import { WalletEntryDirection } from '../enums/wallet-entry-direction.enum';
import { WalletEntryKind } from '../enums/wallet-entry-kind.enum';
import { WalletStatus } from '../enums/wallet-status.enum';
import { WalletEntryRepo } from '../repos/wallet-entry.repo';
import { WalletRepo } from '../repos/wallet.repo';
import type {
  AllocationCredit,
  AllocationCreditOutcome,
  EmployerWallet,
} from '../wallets.contract';
import type { ListMyWalletEntriesQueryDto } from '../validators/list-my-wallet-entries-query.dto';
import type { WalletEntryResponseDto } from '../validators/wallet-entry.dto';
import type { WalletResponseDto } from '../validators/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepo: WalletRepo,
    private readonly walletEntryRepo: WalletEntryRepo,
  ) {}

  /** Used by payment-token issuance to check status and balance without the full DTO. */
  async findSummaryByUserId(
    userId: string,
  ): Promise<Pick<Wallet, 'id' | 'status' | 'balance'>> {
    const wallet = await this.walletRepo.findSummaryByUserId(userId);
    if (!wallet) {
      throw new NotFoundException(ERROR_CODES.WALLET_NOT_FOUND);
    }
    return wallet;
  }

  async getMine(userId: string): Promise<WalletResponseDto> {
    const wallet = await this.walletRepo.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundException(ERROR_CODES.WALLET_NOT_FOUND);
    }
    const last = wallet.entries[0] ?? null;
    return {
      balance: wallet.balance.toString(),
      currency: wallet.currency,
      status: wallet.status,
      lastMovement: last && {
        amount: last.amount.toString(),
        direction: last.direction,
        createdAt: last.createdAt,
      },
    };
  }

  async listMyEntries(
    userId: string,
    query: ListMyWalletEntriesQueryDto,
  ): Promise<CursorPage<WalletEntryResponseDto>> {
    const wallet = await this.walletRepo.findIdByUserId(userId);
    if (!wallet) {
      throw new NotFoundException(ERROR_CODES.WALLET_NOT_FOUND);
    }

    const period = this.readPeriod(query);

    let rows: WalletEntry[];
    try {
      rows = await this.walletEntryRepo.findPageForWallet(
        wallet.id,
        query,
        period,
      );
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const page = paginate<WalletEntry>(rows, query.limit);

    return {
      ...page,
      items: page.items.map((entry) => this.toEntryResponse(entry)),
    };
  }

  async listByEmployer(employerId: string): Promise<EmployerWallet[]> {
    const wallets = await this.walletRepo.findByEmployerId(employerId);

    return wallets.map((wallet) => toEmployerWallet(wallet));
  }

  listWalletIdsCreditedBy(allocationId: string): Promise<string[]> {
    return this.walletEntryRepo.findCreditedWalletIds(allocationId);
  }

  /**
   * Credits every active wallet of an employer inside the caller transaction,
   * by writing one movement per wallet and moving each balance by the same
   * amount. A suspended wallet is left alone and reported as excluded.
   */
  async creditFromAllocation(
    manager: EntityManager,
    { allocationId, employerId, amount }: AllocationCredit,
  ): Promise<AllocationCreditOutcome> {
    const wallets = await this.walletRepo.lockByEmployerId(manager, employerId);
    const credited = wallets.filter(
      (wallet) => wallet.status === WalletStatus.ACTIVE,
    );
    const excluded = wallets.filter(
      (wallet) => wallet.status !== WalletStatus.ACTIVE,
    );

    if (credited.length > 0) {
      await this.walletEntryRepo.insertAll(
        manager,
        credited.map((wallet) => ({
          wallet: { id: wallet.id },
          direction: WalletEntryDirection.CREDIT,
          amount,
          balanceAfter: Number(
            toEuros(toCents(Number(wallet.balance)) + toCents(amount)),
          ),
          kind: WalletEntryKind.ALLOCATION_RECEIVED,
          allocation: { id: allocationId },
        })),
      );
      await this.walletRepo.creditAll(
        manager,
        credited.map((wallet) => wallet.id),
        amount,
      );
    }

    return {
      credited: credited.map((wallet) => toEmployerWallet(wallet)),
      excluded: excluded.map((wallet) => toEmployerWallet(wallet)),
    };
  }

  private readPeriod(query: PeriodQueryDto): Period {
    try {
      return resolvePeriod(query);
    } catch (error) {
      if (error instanceof InvalidPeriodError) {
        throw new UnprocessableEntityException(ERROR_CODES.INVALID_PERIOD);
      }
      throw error;
    }
  }

  private toEntryResponse(entry: WalletEntry): WalletEntryResponseDto {
    return {
      id: entry.id,
      createdAt: entry.createdAt,
      direction: entry.direction,
      amount: entry.amount.toString(),
      kind: entry.kind,
      label:
        entry.payment?.partner.tradeName ?? entry.allocation?.label ?? null,
    };
  }
}

function toEmployerWallet(wallet: Wallet): EmployerWallet {
  return {
    id: wallet.id,
    employeeRef: wallet.employeeRef,
    holderName: wallet.user.name,
    status: wallet.status,
  };
}
