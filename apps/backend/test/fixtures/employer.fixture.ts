import type { DataSource } from 'typeorm';
import { Employer } from '@/modules/employers/entities/employer.entity';

let fixtureSequence = 0;

export function createEmployer(
  dataSource: DataSource,
  ownerId: string,
  overrides: Partial<Employer> = {},
): Promise<Employer> {
  return dataSource.getRepository(Employer).save({
    owner: { id: ownerId },
    name: 'Test Employer',
    siren: `${String(Date.now()).slice(-7)}${String(++fixtureSequence).padStart(2, '0')}`,
    ...overrides,
  });
}
