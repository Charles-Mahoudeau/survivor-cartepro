import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PartnerCategoryResponseDto } from '@/modules/partners/categories/dto/partner-category-response.dto';
import { PartnerCategoriesService } from '@/modules/partners/categories/partner-categories.service';
import { plainToInstance } from 'class-transformer';

@ApiTags('Partner Categories')
@Controller('partners/categories')
export class PartnerCategoriesController {
  constructor(private readonly service: PartnerCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List partner categories' })
  @ApiOkResponse({
    description: 'List of partner categories',
    type: PartnerCategoryResponseDto,
    isArray: true,
  })
  findAll() {
    return plainToInstance(
      PartnerCategoryResponseDto,
      this.service.findAllWithPartnerCount(),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a partner category by slug' })
  @ApiOkResponse({
    description: 'A partner category',
    type: PartnerCategoryResponseDto,
  })
  findOne(@Param('slug') slug: string) {
    return plainToInstance(
      PartnerCategoryResponseDto,
      this.service.findOneWithPartnerCount(slug),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
