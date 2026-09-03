import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerReview } from '@/modules/partners/reviews/entities/partner-review.entity';
import { PartnerCategory } from '@/modules/partners/categories/entities/partner-category.entity';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerReviewsModule } from '@/modules/partners/reviews/partner-reviews.module';
import { PartnerCategoriesModule } from '@/modules/partners/categories/partner-categories.module';

@Module({
  imports: [
    PartnerCategoriesModule,
    PartnerReviewsModule,
    TypeOrmModule.forFeature([Partner, PartnerCategory, PartnerReview]),
  ],
})
export class PartnersCoreModule {}
