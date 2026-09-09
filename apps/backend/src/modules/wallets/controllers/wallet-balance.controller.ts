import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import { GetBalanceDoc } from '../docs/endpoints/get-balance.doc';
import { WalletService } from '../services/wallet.service';

@ApiTags('Wallet')
@Controller('balance')
export class WalletBalanceController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  @Roles(ROLES.ADMIN)
  @GetBalanceDoc()
  get(@Param('userId', new ParseUUIDPipe({ version: '7' })) userId: string) {
    return this.walletService.getBalance(userId);
  }
}
