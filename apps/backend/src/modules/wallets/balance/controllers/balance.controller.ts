import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import { Audited, AuditAction } from '@/modules/audit';
import { WalletService } from '@/modules/wallets/services/wallet.service';
import { GetEmployeeBalanceDoc } from '../docs/endpoints';
import type { BalanceResponseDto } from '../validators';

@ApiTags('Wallet')
@Controller('employees')
export class BalanceController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':id/balance')
  @Roles(ROLES.ADMIN)
  @Audited(AuditAction.ADMIN_ACTION, 'wallet')
  @GetEmployeeBalanceDoc()
  async get(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<BalanceResponseDto> {
    const wallet = await this.walletService.findSummaryByUserId(id);
    return { balance: wallet.balance.toString(), currency: wallet.currency };
  }
}
