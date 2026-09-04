import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import {
  ListPartnersQueryDto,
  PartnerResponseDto,
} from '@/modules/partners/core/dto';
import { PartnerService } from '@/modules/partners/core/services';
import { GetPartnerDoc, ListPartnersDoc } from '@/modules/partners/core/docs';

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

  @Get(':id')
  @Public()
  @GetPartnerDoc()
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<PartnerResponseDto> {
    return this.partnerService.findPublicById(id);
  }
}
