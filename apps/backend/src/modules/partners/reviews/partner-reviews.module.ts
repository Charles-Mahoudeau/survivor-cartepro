import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerReview } from '@/modules/partners/reviews/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, PartnerReview])],
})
export class PartnerReviewsModule {}
