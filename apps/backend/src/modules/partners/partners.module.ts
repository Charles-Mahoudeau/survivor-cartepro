import { Module } from '@nestjs/common';
import { PartnerCategoriesModule } from '@/modules/partners/categories/partner-categories.module';
import { PartnersCoreModule } from '@/modules/partners/core';
import { ApplicationsModule } from '@/modules/partners/applications/applications.module';

// Order matters: PartnersCoreModule's `GET /partners/:id` must be registered
// last, after every module nesting a static segment under `partners/`, so
// Express doesn't capture e.g. `partners/applications` as `partners/:id`.
@Module({
  imports: [PartnerCategoriesModule, ApplicationsModule, PartnersCoreModule],
})
export class PartnersModule {}
