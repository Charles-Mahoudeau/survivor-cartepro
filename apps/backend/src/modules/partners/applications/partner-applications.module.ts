import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersCoreModule } from '@/modules/partners/core';
import { PartnerApplicationsController } from '@/modules/partners/applications/controllers';
import { PartnerApplicationsService } from '@/modules/partners/applications/services';
import { PartnerApplication } from '@/modules/partners/applications/entities';

@Module({
  imports: [PartnersCoreModule, TypeOrmModule.forFeature([PartnerApplication])],
  controllers: [PartnerApplicationsController],
  providers: [PartnerApplicationsService],
})
export class PartnerApplicationsModule {}
