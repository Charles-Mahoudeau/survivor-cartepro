import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { PartnerCategoryFixture } from './partner-category.fixture';

let context: TestApp;

function categoriesUrl(slug = ''): string {
  const server = context.app.getHttpServer() as Server;
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}/api/v1/partners/categories${slug ? `/${slug}` : ''}`;
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

describe('GET /partners/categories', () => {
  it('is reachable without a session, like the catalogue it filters', async () => {
    const category = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'bakery',
      displayName: 'Bakery',
    });

    const response = await fetch(categoriesUrl());
    const body = (await response.json()) as unknown[];

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.arrayContaining([
        {
          slug: category.slug,
          displayName: category.displayName,
          partnerCount: 0,
        },
      ]),
    );
  });
});

describe('GET /partners/categories/:slug', () => {
  it('is reachable without a session, like the catalogue it filters', async () => {
    const category = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'sport-nature',
      displayName: 'Sport & Nature',
    });

    const response = await fetch(categoriesUrl(category.slug));
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual({
      slug: category.slug,
      displayName: category.displayName,
      partnerCount: 0,
    });
  });
});
