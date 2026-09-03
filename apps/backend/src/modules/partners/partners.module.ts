import { Module } from '@nestjs/common';
import { PartnerReviewsModule } from '@/modules/partners/reviews/partner-reviews.module';
import { PartnerCategoriesModule } from '@/modules/partners/categories/partner-categories.module';
import { PartnersCoreModule } from '@/modules/partners/core';

@Module({
  imports: [PartnersCoreModule, PartnerCategoriesModule, PartnerReviewsModule],
})
export class PartnersModule {}
