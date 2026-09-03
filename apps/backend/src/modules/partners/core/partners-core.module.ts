import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerReview } from '@/modules/partners/reviews/entities/partner-review.entity';
import { PartnerCategory } from '@/modules/partners/categories/entities/partner-category.entity';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerReviewsModule } from '@/modules/partners/reviews/partner-reviews.module';
import { PartnerCategoriesModule } from '@/modules/partners/categories/partner-categories.module';
import { PartnerRepo } from '@/modules/partners/core/repos';
import { PartnerService } from '@/modules/partners/core/services';
import { PartnerController } from '@/modules/partners/core/controllers';

@Module({
  imports: [
    PartnerCategoriesModule,
    PartnerReviewsModule,
    TypeOrmModule.forFeature([Partner, PartnerCategory, PartnerReview]),
  ],
  providers: [PartnerRepo, PartnerService],
  controllers: [PartnerController],
  exports: [PartnerService],
})
export class PartnersCoreModule {}
