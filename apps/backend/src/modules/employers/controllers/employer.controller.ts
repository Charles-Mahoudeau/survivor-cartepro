import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationQueryDto } from '@/common/pagination';
import { ROLES } from '@/config/auth/auth.constants';
import { CreateEmployerDoc, ListEmployersDoc } from '../docs';
import { EmployerService } from '../services/employer.service';
import { CreateEmployerDto } from '../validators';

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
  @CreateEmployerDoc()
  create(@Body() body: CreateEmployerDto) {
    return this.employerService.create(body);
  }
}
