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
import { Audited, AuditAction } from '@/modules/audit';
import type { AuditResolverContext } from '@/modules/audit';
import {
  DecideApplicationDto,
  ListApplicationsQueryDto,
} from '@/modules/partners/applications/dto';
import { ApplicationDecision } from '@/modules/partners/applications/enums';
import { ApplicationsService } from '@/modules/partners/applications/services';
import {
  DecideApplicationDoc,
  GetMyApplicationDoc,
  GetApplicationDoc,
  ListApplicationsDoc,
} from '@/modules/partners/applications/docs';

/** The decision that came in on the request body, for `resolveAction`. */
const resolveDecisionAction = ({ body }: AuditResolverContext): AuditAction =>
  (body as DecideApplicationDto).decision === ApplicationDecision.APPROVED
    ? AuditAction.PARTNER_APPROVED
    : AuditAction.PARTNER_REFUSED;

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

  @Post(':id/decision')
  @Roles(ROLES.ADMIN)
  @Audited(AuditAction.PARTNER_APPROVED, 'partner', {
    resolveAction: resolveDecisionAction,
  })
  @DecideApplicationDoc()
  decide(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() dto: DecideApplicationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.applicationsService.decide(id, dto, user.id);
  }
}
