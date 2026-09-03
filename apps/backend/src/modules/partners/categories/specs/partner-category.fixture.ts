import type { DataSource, DeepPartial } from 'typeorm';
import { PartnerCategory } from '@/modules/partners/categories/entities/partner-category.entity';

export class PartnerCategoryFixture {
  static create(
    dataSource: DataSource,
    overrides: DeepPartial<PartnerCategory> = {},
  ): Promise<PartnerCategory> {
    const category = dataSource.getRepository(PartnerCategory).create({
      slug: `category-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      displayName: 'Test category',
      ...overrides,
    });

    return dataSource.getRepository(PartnerCategory).save(category);
  }
}
