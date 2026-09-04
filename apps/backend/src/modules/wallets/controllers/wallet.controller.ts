import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationQueryDto } from '@/common/pagination';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import { GetMyWalletDoc } from '../docs/endpoints/get-my-wallet.doc';
import { ListMyWalletEntriesDoc } from '../docs/endpoints/list-my-wallet-entries.doc';
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

  @Get('entries')
  @Roles(ROLES.EMPLOYEE)
  @ListMyWalletEntriesDoc()
  listMyEntries(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.walletService.listMyEntries(user.id, query);
  }
}
