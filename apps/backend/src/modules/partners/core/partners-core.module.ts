import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerCategory } from '@/modules/partners/categories/entities/partner-category.entity';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerCategoriesModule } from '@/modules/partners/categories/partner-categories.module';
import { PartnerRepo } from '@/modules/partners/core/repos';
import { PartnerService } from '@/modules/partners/core/services';
import { PartnerController } from '@/modules/partners/core/controllers';

@Module({
  imports: [
    PartnerCategoriesModule,
    TypeOrmModule.forFeature([Partner, PartnerCategory]),
  ],
  providers: [PartnerRepo, PartnerService],
  controllers: [PartnerController],
  exports: [PartnerService],
})
export class PartnersCoreModule {}
