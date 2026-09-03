import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { signUp } from '../../../../../test/fixtures/user.fixture';
import { PartnerFixture } from './partner.fixture';

let context: TestApp;

function partnerUrl(id: string): string {
  const server = context.app.getHttpServer() as Server;
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}/api/v1/partners/${id}`;
}

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('GET /partners/:id', () => {
  it('returns the public projection of an active partner without a session', async () => {
    const owner = await signUp(context.app, 'partner-owner@tickettout.test');
    const partner = await PartnerFixture.create(context.dataSource, owner.id);

    const response = await fetch(partnerUrl(partner.id));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      id: partner.id,
      legalName: partner.legalName,
      tradeName: partner.tradeName,
      addressLine: partner.addressLine,
      postalCode: partner.postalCode,
      city: partner.city,
      latitude: partner.latitude,
      longitude: partner.longitude,
      categories: [],
    });
    expect(body).not.toHaveProperty('siren');
    expect(body).not.toHaveProperty('businessPurpose');
  });

  it.each([PartnerStatus.PENDING, PartnerStatus.REFUSED, PartnerStatus.BANNED])(
    'hides a partner with status %s',
    async (status) => {
      const owner = await signUp(
        context.app,
        `partner-${status}@tickettout.test`,
      );
      const partner = await PartnerFixture.create(
        context.dataSource,
        owner.id,
        {
          status,
        },
      );

      const response = await fetch(partnerUrl(partner.id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({
        statusCode: 404,
        message: 'PARTNER_NOT_FOUND',
        error: 'Not Found',
      });
    },
  );

  it('uses the same not-found response for an unknown valid UUID', async () => {
    const response = await fetch(
      partnerUrl('0190f5c0-0000-7000-8000-000000000000'),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      statusCode: 404,
      message: 'PARTNER_NOT_FOUND',
      error: 'Not Found',
    });
  });

  it('rejects a malformed UUID before looking up a partner', async () => {
    const response = await fetch(partnerUrl('not-a-uuid'));

    expect(response.status).toBe(400);
  });

  it('stores sensitive partner fields without returning them publicly', async () => {
    const owner = await signUp(context.app, 'partner-private@tickettout.test');
    const partner = await PartnerFixture.create(context.dataSource, owner.id);

    const response = await fetch(partnerUrl(partner.id));
    const body = await response.json();
    const persisted = await context.dataSource
      .getRepository(Partner)
      .findOneByOrFail({ id: partner.id });

    expect(persisted.siren).toBe(partner.siren);
    expect(persisted.businessPurpose).toBe(partner.businessPurpose);
    expect(body).not.toHaveProperty('siren');
    expect(body).not.toHaveProperty('businessPurpose');
  });
});
