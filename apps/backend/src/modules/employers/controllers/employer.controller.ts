import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationQueryDto } from '@/common/pagination';
import { ROLES } from '@/config/auth/auth.constants';
import { Audited, AuditAction } from '@/modules/audit';
import type { AuditResolverContext } from '@/modules/audit';
import { CreateEmployerDoc, ListEmployersDoc } from '../docs';
import { EmployerService } from '../services/employer.service';
import { CreateEmployerDto, EmployerResponseDto } from '../validators';

/** The route has no `:id` — the target only exists once the create succeeds. */
const resolveCreatedEmployerId = ({ result }: AuditResolverContext): string =>
  (result as EmployerResponseDto).id;

@ApiTags('Employers')
@Controller('employers')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Get()
  @Roles(ROLES.ADMIN)
  @ListEmployersDoc()
  list(@Query() query: PaginationQueryDto) {
    return this.employerService.list(query);
  }

  @Post()
  @Roles(ROLES.ADMIN)
  @Audited(AuditAction.ADMIN_ACTION, 'employer', {
    resolveTargetId: resolveCreatedEmployerId,
  })
  @CreateEmployerDoc()
  create(@Body() body: CreateEmployerDto) {
    return this.employerService.create(body);
  }
}
