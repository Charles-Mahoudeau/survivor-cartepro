import { Module } from '@nestjs/common';
import { PartnerCategoriesController } from '@/modules/partners/categories/partner-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerCategory } from '@/modules/partners/entities/partner-category.entity';
import { PartnerCategoriesService } from '@/modules/partners/categories/partner-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerCategory])],
  controllers: [PartnerCategoriesController],
  providers: [PartnerCategoriesService],
})
export class PartnersModule {}
