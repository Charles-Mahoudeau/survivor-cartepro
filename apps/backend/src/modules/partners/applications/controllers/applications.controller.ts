import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import {
  ApproveApplicationDto,
  ListApplicationsQueryDto,
} from '@/modules/partners/applications/dto';
import { ApplicationsService } from '@/modules/partners/applications/services';
import {
  ApproveApplicationDoc,
  GetMyApplicationDoc,
  GetApplicationDoc,
  ListApplicationsDoc,
} from '@/modules/partners/applications/docs';

@ApiTags('Partner Applications')
@Controller('partners/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @Roles(ROLES.ADMIN)
  @ListApplicationsDoc()
  list(@Query() query: ListApplicationsQueryDto) {
    return this.applicationsService.list(query);
  }

  // Declared before `:id` so Nest doesn't route this path into that handler.
  @Get('me')
  @Roles(ROLES.PARTNER)
  @GetMyApplicationDoc()
  getMine(@CurrentUser() user: AuthUser) {
    return this.applicationsService.getMine(user.id);
  }

  @Get(':id')
  @Roles(ROLES.ADMIN)
  @GetApplicationDoc()
  getById(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.applicationsService.getById(id);
  }

  @Post(':id/approve')
  @Roles(ROLES.ADMIN)
  @ApproveApplicationDoc()
  approve(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() dto: ApproveApplicationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.applicationsService.approve(id, dto.reason, user.id);
  }
}
