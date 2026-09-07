import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ROLES } from '@/config/auth/auth.constants';
import type { AuthUser } from '@/config/auth/auth';
import {
  ListPartnersQueryDto,
  PartnerProfileResponseDto,
  PartnerResponseDto,
} from '@/modules/partners/core/dto';
import { PartnerService } from '@/modules/partners/core/services';
import {
  GetMyPartnerProfileDoc,
  GetPartnerDoc,
  GetPartnerProfileByIdDoc,
  ListPartnersDoc,
} from '@/modules/partners/core/docs';

@ApiTags('Partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

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

  @Get(':id/profile')
  @Roles(ROLES.ADMIN)
  @GetPartnerProfileByIdDoc()
  findPartnerProfileById(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<PartnerProfileResponseDto> {
    return this.partnerService.getProfileByPartnerId(id);
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
