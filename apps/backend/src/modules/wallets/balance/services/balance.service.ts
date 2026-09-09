import { Injectable } from '@nestjs/common';
import { WalletService } from '@/modules/wallets/services/wallet.service';
import type { BalanceResponseDto } from '../validators/balance.dto';

/** Reads one employee balance for the third-party surface. */
@Injectable()
export class BalanceService {
  constructor(private readonly walletService: WalletService) {}

  async getForEmployee(employeeId: string): Promise<BalanceResponseDto> {
    const wallet = await this.walletService.findSummaryByUserId(employeeId);
    return { balance: wallet.balance.toString(), currency: wallet.currency };
  }
}
