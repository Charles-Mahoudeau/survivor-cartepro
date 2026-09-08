import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersCoreModule } from '@/modules/partners/core';
import { ApplicationsController } from '@/modules/partners/applications/controllers';
import { ApplicationsService } from '@/modules/partners/applications/services';
import { ApplicationRepo } from '@/modules/partners/applications/repos';
import { Application } from '@/modules/partners/applications/entities';

@Module({
  imports: [PartnersCoreModule, TypeOrmModule.forFeature([Application])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationRepo],
})
export class ApplicationsModule {}
