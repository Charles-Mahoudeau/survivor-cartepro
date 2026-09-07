import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import { ListPartnerApplicationsQueryDto } from '@/modules/partners/applications/dto';
import { PartnerApplicationsService } from '@/modules/partners/applications/services';
import { ListPartnerApplicationsDoc } from '@/modules/partners/applications/docs';

@ApiTags('Partner applications')
@Controller('partner-applications')
export class PartnerApplicationsController {
  constructor(
    private readonly partnerApplicationsService: PartnerApplicationsService,
  ) {}

  @Get()
  @Roles(ROLES.ADMIN)
  @ListPartnerApplicationsDoc()
  list(@Query() query: ListPartnerApplicationsQueryDto) {
    return this.partnerApplicationsService.list(query);
  }
}
