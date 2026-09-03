import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { PartnerResponseDto } from '@/modules/partners/core/dto';
import { PartnerService } from '@/modules/partners/core/services';
import { GetPartnerDoc } from '@/modules/partners/core/docs';

@ApiTags('Partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get(':id')
  @Public()
  @GetPartnerDoc()
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<PartnerResponseDto> {
    return this.partnerService.findPublicById(id);
  }
}
