import type { DataSource, DeepPartial } from 'typeorm';
import { Application } from '@/modules/partners/applications/entities/application.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

export class PartnerReviewFixture {
  static create(
    dataSource: DataSource,
    partnerId: string,
    decidedById: string,
    overrides: DeepPartial<Application> = {},
  ): Promise<Application> {
    const review = dataSource.getRepository(Application).create({
      partner: { id: partnerId },
      decidedBy: { id: decidedById },
      fromStatus: PartnerStatus.PENDING,
      toStatus: PartnerStatus.ACTIVE,
      reason: 'Validation approved',
      ...overrides,
    });

    return dataSource.getRepository(Application).save(review);
  }
}
