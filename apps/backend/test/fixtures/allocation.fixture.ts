import type { DataSource } from 'typeorm';
import { Allocation } from '@/modules/allocations/entities/allocation.entity';

export function createAllocation(
  dataSource: DataSource,
  employerId: string,
  createdById: string,
  overrides: Partial<Allocation> = {},
): Promise<Allocation> {
  return dataSource.getRepository(Allocation).save({
    employer: { id: employerId },
    label: 'Campagne test',
    amount: 50,
    createdBy: { id: createdById },
    ...overrides,
  });
}
