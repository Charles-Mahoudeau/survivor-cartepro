import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { GetPartnerCategoryDoc, ListPartnerCategoriesDoc } from '../docs';
import { PartnerCategoriesService } from '@/modules/partners/categories/services/partner-categories.service';

@ApiTags('Partner Categories')
@Controller('partners/categories')
export class PartnerCategoriesController {
  constructor(private readonly service: PartnerCategoriesService) {}

  @Get()
  @Public()
  @ListPartnerCategoriesDoc()
  findAll() {
    return this.service.findAllWithPartnerCount();
  }

  @Get(':slug')
  @Public()
  @GetPartnerCategoryDoc()
  findOne(@Param('slug') slug: string) {
    return this.service.findOneWithPartnerCount(slug);
  }
}
