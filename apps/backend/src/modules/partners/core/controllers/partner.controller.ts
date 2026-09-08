import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import {
  CreatePartnerDto,
  ListPartnersQueryDto,
  PartnerProfileResponseDto,
  PartnerResponseDto,
  UpdatePartnerProfileDto,
} from '@/modules/partners/core/dto';
import { PartnerService } from '@/modules/partners/core/services';
import {
  CreatePartnerDoc,
  GetMyPartnerProfileDoc,
  GetPartnerDoc,
  GetPartnerProfileByIdDoc,
  ListPartnersDoc,
  UpdateMyPartnerProfileDoc,
  UpdatePartnerProfileByIdDoc,
} from '@/modules/partners/core/docs';

@ApiTags('Partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @Roles(ROLES.EMPLOYEE)
  @CreatePartnerDoc()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePartnerDto,
  ): Promise<PartnerProfileResponseDto> {
    return this.partnerService.createForOwner(user.id, dto);
  }

  @Get()
  @Public()
  @ListPartnersDoc()
  list(@Query() query: ListPartnersQueryDto) {
    return this.partnerService.listPublic(query);
  }

  @Get('me/profile')
  @Roles(ROLES.PARTNER)
  @GetMyPartnerProfileDoc()
  findMyProfile(
    @CurrentUser() user: AuthUser,
  ): Promise<PartnerProfileResponseDto> {
    return this.partnerService.getProfileByOwnerId(user.id);
  }

  @Patch('me/profile')
  @Roles(ROLES.PARTNER)
  @UpdateMyPartnerProfileDoc()
  updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    return this.partnerService.updateProfileByOwnerId(user.id, dto);
  }

  @Get(':id/profile')
  @Roles(ROLES.ADMIN)
  @GetPartnerProfileByIdDoc()
  findPartnerProfileById(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<PartnerProfileResponseDto> {
    return this.partnerService.getProfileByPartnerId(id);
  }

  @Patch(':id/profile')
  @Roles(ROLES.ADMIN)
  @UpdatePartnerProfileByIdDoc()
  updatePartnerProfileById(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    return this.partnerService.updateProfileByPartnerId(id, dto);
  }

  @Get(':id')
  @Public()
  @GetPartnerDoc()
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<PartnerResponseDto> {
    return this.partnerService.findPublicById(id);
  }
}
