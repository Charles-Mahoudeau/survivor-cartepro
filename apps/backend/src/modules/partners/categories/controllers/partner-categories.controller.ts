import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PartnerCategoryResponseDto } from '@/modules/partners/categories/dto/partner-category-response.dto';
import { GetPartnerCategoryDoc, ListPartnerCategoriesDoc } from '../docs';
import { PartnerCategoriesService } from '@/modules/partners/categories/services/partner-categories.service';
import { plainToInstance } from 'class-transformer';

@ApiTags('Partner Categories')
@Controller('partners/categories')
export class PartnerCategoriesController {
  constructor(private readonly service: PartnerCategoriesService) {}

  @Get()
  @ListPartnerCategoriesDoc()
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
  @GetPartnerCategoryDoc()
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
