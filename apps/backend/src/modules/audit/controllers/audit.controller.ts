import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import { ListAuditDoc } from '../docs';
import { AuditService } from '../services';
import { ListAuditQueryDto } from '../validators';

@ApiTags('Audit')
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(ROLES.ADMIN)
  @ListAuditDoc()
  list(@Query() query: ListAuditQueryDto) {
    return this.auditService.list(query);
  }
}
