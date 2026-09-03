import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import { GetMyWalletDoc } from '../docs/endpoints/get-my-wallet.doc';
import { WalletService } from '../services/wallet.service';

@ApiTags('Wallet')
@Controller('me/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @Roles(ROLES.EMPLOYEE)
  @GetMyWalletDoc()
  getMine(@CurrentUser() user: AuthUser) {
    return this.walletService.getMine(user.id);
  }
}
