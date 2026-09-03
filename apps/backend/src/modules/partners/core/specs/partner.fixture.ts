import type { DataSource, DeepPartial } from 'typeorm';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

let fixtureSequence = 0;

export class PartnerFixture {
  static create(
    dataSource: DataSource,
    ownerId: string,
    overrides: DeepPartial<Partner> = {},
  ): Promise<Partner> {
    const partner = dataSource.getRepository(Partner).create({
      legalName: 'Test Partner',
      tradeName: 'Test Partner',
      siren: `${String(Date.now()).slice(-7)}${String(++fixtureSequence).padStart(2, '0')}`,
      businessPurpose: 'Test business purpose',
      status: PartnerStatus.ACTIVE,
      addressLine: '1 Test Street',
      postalCode: '75001',
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      owner: { id: ownerId },
      ...overrides,
    });

    return dataSource.getRepository(Partner).save(partner);
  }
}
