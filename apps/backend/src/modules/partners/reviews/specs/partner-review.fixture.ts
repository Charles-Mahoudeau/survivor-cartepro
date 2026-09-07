import type { DataSource, DeepPartial } from 'typeorm';
import { PartnerReview } from '@/modules/partners/reviews/entities/partner-review.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

export class PartnerReviewFixture {
  static create(
    dataSource: DataSource,
    partnerId: string,
    decidedById: string,
    overrides: DeepPartial<PartnerReview> = {},
  ): Promise<PartnerReview> {
    const review = dataSource.getRepository(PartnerReview).create({
      partner: { id: partnerId },
      decidedBy: { id: decidedById },
      fromStatus: PartnerStatus.PENDING,
      toStatus: PartnerStatus.ACTIVE,
      reason: 'Validation approved',
      ...overrides,
    });

    return dataSource.getRepository(PartnerReview).save(review);
  }
}
