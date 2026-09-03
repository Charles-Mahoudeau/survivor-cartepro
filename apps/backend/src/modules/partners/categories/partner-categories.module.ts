import { Module } from '@nestjs/common';
import { PartnerCategoriesController } from '@/modules/partners/categories/controllers/partner-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerCategory } from '@/modules/partners/categories/entities/partner-category.entity';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerCategoriesService } from '@/modules/partners/categories/services';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, PartnerCategory])],
  controllers: [PartnerCategoriesController],
  providers: [PartnerCategoriesService],
})
export class PartnerCategoriesModule {}
