import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerCategory } from './entities/partner-category.entity';
import { PartnerReview } from './entities/partner-review.entity';
import { Partner } from './entities/partner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, PartnerCategory, PartnerReview]),
  ],
})
export class PartnersModule {}
