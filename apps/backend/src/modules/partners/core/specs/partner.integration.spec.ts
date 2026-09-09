import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import { PartnerCategoryFixture } from '@/modules/partners/categories/specs/partner-category.fixture';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { signUp } from '../../../../../test/fixtures/user.fixture';
import { PartnerFixture } from './partner.fixture';

let context: TestApp;

type PartnerListBody = {
  items: Array<{
    id: string;
    legalName?: string;
    categories?: Array<{ slug: string; displayName: string }>;
    siren?: unknown;
    businessPurpose?: unknown;
  }>;
  nextCursor: string | null;
  hasMore: boolean;
};

function partnerUrl(id: string): string {
  const server = context.app.getHttpServer() as Server;
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}/api/v1/partners/${id}`;
}

function partnersUrl(query = ''): string {
  const server = context.app.getHttpServer() as Server;
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}/api/v1/partners${query}`;
}

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

describe('GET /partners/:id', () => {
  it('returns the public projection of an active partner without a session', async () => {
    const owner = await signUp(context.app, 'partner-owner@tickettout.test');
    const partner = await PartnerFixture.create(context.dataSource, owner.id);

    const response = await fetch(partnerUrl(partner.id));
    const body = (await response.json()) as Record<string, unknown>;

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
    const body = (await response.json()) as Record<string, unknown>;

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

describe('GET /partners', () => {
  it('returns a public page containing only active partners', async () => {
    const activeOwner = await signUp(
      context.app,
      'list-active@tickettout.test',
    );
    const active = await PartnerFixture.create(
      context.dataSource,
      activeOwner.id,
      {
        legalName: 'Active Bakery',
      },
    );
    const inactiveOwner = await signUp(
      context.app,
      'list-inactive@tickettout.test',
    );
    const inactive = await PartnerFixture.create(
      context.dataSource,
      inactiveOwner.id,
      {
        status: PartnerStatus.PENDING,
      },
    );

    const response = await fetch(partnersUrl());
    const body = (await response.json()) as PartnerListBody;

    expect(response.status).toBe(200);
    expect(body.items.map((item: { id: string }) => item.id)).toContain(
      active.id,
    );
    expect(body.items.map((item) => item.id)).not.toEqual(
      expect.arrayContaining([inactive.id]),
    );
    expect(body).toEqual(
      expect.objectContaining({
        nextCursor: null,
        hasMore: false,
      }),
    );
  });

  it('searches partner names and cities without case or accent sensitivity', async () => {
    const owner = await signUp(context.app, 'list-search@tickettout.test');
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      tradeName: 'Boulangerie Étoilée',
      city: 'Montélimar',
    });

    const nameResponse = await fetch(partnersUrl('?search=BOULANGERIE'));
    const cityResponse = await fetch(partnersUrl('?search=montelimár'));
    const nameBody = (await nameResponse.json()) as PartnerListBody;
    const cityBody = (await cityResponse.json()) as PartnerListBody;

    expect(nameBody.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: partner.id })]),
    );
    expect(cityBody.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: partner.id })]),
    );
  });

  it('filters partners by category slug', async () => {
    const category = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'bakery',
      displayName: 'Bakery',
    });
    const matchingOwner = await signUp(
      context.app,
      'list-category-match@tickettout.test',
    );
    const otherOwner = await signUp(
      context.app,
      'list-category-other@tickettout.test',
    );
    const matching = await PartnerFixture.create(
      context.dataSource,
      matchingOwner.id,
      { categories: [category] },
    );
    await PartnerFixture.create(context.dataSource, otherOwner.id);

    const response = await fetch(partnersUrl('?category=bakery'));
    const body = (await response.json()) as PartnerListBody;

    expect(body.items).toEqual([
      expect.objectContaining({
        id: matching.id,
        categories: [{ slug: 'bakery', displayName: 'Bakery' }],
      }),
    ]);
  });

  it('returns consecutive pages without duplicates or gaps', async () => {
    const partners: Partner[] = [];
    for (const email of [
      'list-page-one@tickettout.test',
      'list-page-two@tickettout.test',
      'list-page-three@tickettout.test',
    ]) {
      const owner = await signUp(context.app, email);
      partners.push(await PartnerFixture.create(context.dataSource, owner.id));
    }

    const firstResponse = await fetch(partnersUrl('?limit=2'));
    const firstPage = (await firstResponse.json()) as PartnerListBody;
    expect(firstPage.hasMore).toBe(true);
    const secondResponse = await fetch(
      partnersUrl(
        `?limit=2&cursor=${encodeURIComponent(firstPage.nextCursor!)}`,
      ),
    );
    const secondPage = (await secondResponse.json()) as PartnerListBody;
    const returnedIds = [...firstPage.items, ...secondPage.items].map(
      (item: { id: string }) => item.id,
    );

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(new Set(returnedIds).size).toBe(returnedIds.length);
    expect(returnedIds).toEqual(
      expect.arrayContaining(partners.map((partner) => partner.id)),
    );
  });

  it('rejects invalid pagination parameters', async () => {
    const invalidLimit = await fetch(partnersUrl('?limit=0'));
    const invalidCursor = await fetch(partnersUrl('?cursor=not-a-cursor'));

    expect(invalidLimit.status).toBe(400);
    expect(invalidCursor.status).toBe(400);
  });

  it('does not expose sensitive partner fields in list responses', async () => {
    const owner = await signUp(context.app, 'list-private@tickettout.test');
    await PartnerFixture.create(context.dataSource, owner.id, {
      siren: '123456789',
      businessPurpose: 'Private purpose',
    });

    const body = (await fetch(partnersUrl()).then((result) =>
      result.json(),
    )) as PartnerListBody;

    for (const item of body.items) {
      expect(item).not.toHaveProperty('siren');
      expect(item).not.toHaveProperty('businessPurpose');
    }
  });
});
