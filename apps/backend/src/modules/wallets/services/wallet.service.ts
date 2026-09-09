import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { isDebitAllowed } from './helpers';
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
  PaymentDebit,
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

  /** Called once per account, right after it is created — see `config/auth`. */
  createDefault(userId: string): Promise<Wallet> {
    return this.walletRepo.create(userId);
  }

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

  /** Spendable wallets per employer, keyed by employer, in one read. */
  async countActiveByEmployer(
    employerIds: string[],
  ): Promise<Map<string, number>> {
    const rows = await this.walletRepo.countActiveByEmployerIds(employerIds);

    return new Map(rows.map((row) => [row.employerId, Number(row.count)]));
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

  /**
   * Debits one wallet for a payment inside the caller transaction: locks the
   * wallet, refuses a suspended one or a debit past the overdraft limit, then
   * writes the entry and moves the balance together. Never called outside a
   * transaction — a debit with no matching payment row is exactly the state
   * this guards against.
   *
   * The refusals name no figure. The caller here is the partner at the till,
   * and a balance is the employee's to know.
   */
  async debitForPayment(
    manager: EntityManager,
    { walletId, amount, paymentId }: PaymentDebit,
  ): Promise<void> {
    const wallet = await this.walletRepo.lockById(manager, walletId);
    if (!wallet) {
      throw new NotFoundException(ERROR_CODES.WALLET_NOT_FOUND);
    }
    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new ForbiddenException(ERROR_CODES.ACCOUNT_BANNED);
    }

    const balance = Number(wallet.balance);
    const normalizedAmount = Number(toEuros(toCents(amount)));

    if (!isDebitAllowed(balance, normalizedAmount)) {
      throw new UnprocessableEntityException(ERROR_CODES.INSUFFICIENT_BALANCE);
    }

    const balanceAfter = Number(
      toEuros(toCents(balance) - toCents(normalizedAmount)),
    );

    await this.walletEntryRepo.insertAll(manager, [
      {
        wallet: { id: walletId },
        direction: WalletEntryDirection.DEBIT,
        amount: normalizedAmount,
        balanceAfter,
        kind: WalletEntryKind.PAYMENT_SENT,
        payment: { id: paymentId },
      },
    ]);
    await this.walletRepo.debitById(manager, walletId, normalizedAmount);
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
