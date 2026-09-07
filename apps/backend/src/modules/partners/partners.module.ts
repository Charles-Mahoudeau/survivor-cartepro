import { Module } from '@nestjs/common';
import { PartnerReviewsModule } from '@/modules/partners/reviews/partner-reviews.module';
import { PartnerCategoriesModule } from '@/modules/partners/categories/partner-categories.module';
import { PartnersCoreModule } from '@/modules/partners/core';
import { PartnerApplicationsModule } from '@/modules/partners/applications/partner-applications.module';

@Module({
  imports: [
    PartnerCategoriesModule,
    PartnerReviewsModule,
    PartnersCoreModule,
    PartnerApplicationsModule,
  ],
})
export class PartnersModule {}
