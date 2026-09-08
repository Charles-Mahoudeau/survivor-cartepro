import type { DataSource, DeepPartial } from 'typeorm';
import { Employer } from '@/modules/employers/entities/employer.entity';

let fixtureSequence = 0;

export function createEmployer(
  dataSource: DataSource,
  overrides: DeepPartial<Employer> = {},
): Promise<Employer> {
  return dataSource.getRepository(Employer).save({
    name: 'Test Employer',
    siren: `${String(Date.now()).slice(-7)}${String(++fixtureSequence).padStart(2, '0')}`,
    ...overrides,
  });
}
