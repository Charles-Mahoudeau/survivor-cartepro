import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationQueryDto } from '@/common/pagination';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import { Audited, AuditAction } from '@/modules/audit';
import {
  ApplyAllocationDoc,
  CreateAllocationDoc,
  GetAllocationDoc,
  ListAllocationsDoc,
  UpdateAllocationDoc,
} from '../docs';
import { AllocationService } from '../services/allocation.service';
import { CreateAllocationDto, UpdateAllocationDto } from '../validators';

@ApiTags('Allocations')
@Controller('allocations')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Get()
  @Roles(ROLES.ADMIN)
  @ListAllocationsDoc()
  list(@Query() query: PaginationQueryDto) {
    return this.allocationService.list(query);
  }

  @Post()
  @Roles(ROLES.ADMIN)
  @CreateAllocationDoc()
  create(@CurrentUser() agent: AuthUser, @Body() body: CreateAllocationDto) {
    return this.allocationService.create(body, agent.id);
  }

  @Get(':id')
  @Roles(ROLES.ADMIN)
  @GetAllocationDoc()
  findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.allocationService.findById(id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN)
  @UpdateAllocationDoc()
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() body: UpdateAllocationDto,
  ) {
    return this.allocationService.update(id, body);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLES.ADMIN)
  @Audited(AuditAction.ALLOCATION_APPLIED, 'allocation')
  @ApplyAllocationDoc()
  apply(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.allocationService.apply(id);
  }
}
