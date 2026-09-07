import { Module } from '@nestjs/common';
import { PartnerCategoriesModule } from '@/modules/partners/categories/partner-categories.module';
import { PartnersCoreModule } from '@/modules/partners/core';
import { PartnerApplicationsModule } from '@/modules/partners/applications/partner-applications.module';

@Module({
  imports: [
    PartnerCategoriesModule,
    PartnersCoreModule,
    PartnerApplicationsModule,
  ],
})
export class PartnersModule {}
