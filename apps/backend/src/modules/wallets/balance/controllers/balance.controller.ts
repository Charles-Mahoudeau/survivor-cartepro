import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import { Audited, AuditAction } from '@/modules/audit';
import { GetEmployeeBalanceDoc } from '../docs/endpoints';
import { BalanceService } from '../services';

@ApiTags('Wallet')
@Controller('employees')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':id/balance')
  @Roles(ROLES.ADMIN)
  @Audited(AuditAction.ADMIN_ACTION, 'wallet')
  @GetEmployeeBalanceDoc()
  get(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.balanceService.getForEmployee(id);
  }
}
