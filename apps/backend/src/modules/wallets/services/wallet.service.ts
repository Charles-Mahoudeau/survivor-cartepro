import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InvalidCursorError,
  paginate,
  type CursorPage,
  type PaginationQueryDto,
} from '@/common/pagination';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { WalletEntry } from '../entities/wallet-entry.entity';
import type { Wallet } from '../entities/wallet.entity';
import { WalletEntryRepo } from '../repos/wallet-entry.repo';
import { WalletRepo } from '../repos/wallet.repo';
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
    query: PaginationQueryDto,
  ): Promise<CursorPage<WalletEntryResponseDto>> {
    const wallet = await this.walletRepo.findIdByUserId(userId);
    if (!wallet) {
      throw new NotFoundException(ERROR_CODES.WALLET_NOT_FOUND);
    }

    let rows: WalletEntry[];
    try {
      rows = await this.walletEntryRepo.findPageForWallet(wallet.id, query);
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
