import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import { ListPartnerApplicationsQueryDto } from '@/modules/partners/applications/dto';
import { PartnerApplicationsService } from '@/modules/partners/applications/services';
import {
  GetMyPartnerApplicationDoc,
  GetPartnerApplicationDoc,
  ListPartnerApplicationsDoc,
} from '@/modules/partners/applications/docs';

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

  // Declared before `:id` so Nest doesn't route this path into that handler.
  @Get('me')
  @Roles(ROLES.PARTNER)
  @GetMyPartnerApplicationDoc()
  getMine(@CurrentUser() user: AuthUser) {
    return this.partnerApplicationsService.getMine(user.id);
  }

  @Get(':id')
  @Roles(ROLES.ADMIN)
  @GetPartnerApplicationDoc()
  getById(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.partnerApplicationsService.getById(id);
  }
}
