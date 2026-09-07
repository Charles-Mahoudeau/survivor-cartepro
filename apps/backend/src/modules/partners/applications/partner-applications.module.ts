import { Module } from '@nestjs/common';
import { PartnersCoreModule } from '@/modules/partners/core';
import { PartnerApplicationsController } from '@/modules/partners/applications/controllers';
import { PartnerApplicationsService } from '@/modules/partners/applications/services';

@Module({
  imports: [PartnersCoreModule],
  controllers: [PartnerApplicationsController],
  providers: [PartnerApplicationsService],
})
export class PartnerApplicationsModule {}
