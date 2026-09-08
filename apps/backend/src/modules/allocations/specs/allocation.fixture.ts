import type { DataSource, DeepPartial } from 'typeorm';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';

export class AllocationFixture {
  static create(
    dataSource: DataSource,
    employerId: string,
    createdById: string,
    overrides: DeepPartial<Allocation> = {},
  ): Promise<Allocation> {
    const allocation = dataSource.getRepository(Allocation).create({
      employer: { id: employerId },
      label: 'Campagne test',
      amount: 50,
      createdBy: { id: createdById },
      ...overrides,
    });

    return dataSource.getRepository(Allocation).save(allocation);
  }
}
