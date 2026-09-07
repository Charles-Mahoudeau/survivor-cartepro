import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { grantRole, signUp } from '../../../../../test/fixtures/user.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import { ROLES } from '@/config/auth/auth.constants';
import { PartnerCategoryFixture } from '@/modules/partners/categories/specs/partner-category.fixture';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import { PartnerFixture } from './partner.fixture';
import { PartnerReviewFixture } from '@/modules/partners/reviews/specs/partner-review.fixture';
import type { PartnerProfileResponseDto } from '@/modules/partners/core/dto';

let context: TestApp;

const getMyPartnerProfile = (cookie?: string[]) => {
  const req = api(context.app).get(apiPath('/partners/me/profile'));
  return cookie ? req.set('Cookie', cookie) : req;
};

const getPartnerProfileById = (id: string, cookie?: string[]) => {
  const req = api(context.app).get(apiPath(`/partners/${id}/profile`));
  return cookie ? req.set('Cookie', cookie) : req;
};

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

describe('GET /partners/me/profile', () => {
  it('returns the full dossier for the authenticated partner without reviews', async () => {
    const category = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });
    const user = await signUp(context.app, 'merchant@tickettout.test');
    await grantRole(context, user.id, ROLES.PARTNER);

    const partner = await PartnerFixture.create(context.dataSource, user.id, {
      legalName: 'Bistro Parisien SAS',
      tradeName: 'Le Bistro',
      siren: '123456789',
      businessPurpose: 'Traditional restaurant services',
      status: PartnerStatus.ACTIVE,
      addressLine: '10 Rue de Paris',
      postalCode: '75001',
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      categories: [category],
    });

    const response = await getMyPartnerProfile(user.cookie).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body).toEqual({
      id: partner.id,
      legalName: 'Bistro Parisien SAS',
      tradeName: 'Le Bistro',
      siren: '123456789',
      businessPurpose: 'Traditional restaurant services',
      status: PartnerStatus.ACTIVE,
      addressLine: '10 Rue de Paris',
      postalCode: '75001',
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      categories: [
        {
          slug: 'restaurant',
          displayName: 'Restaurant',
        },
      ],
      lastDecision: null,
    });
  });

  it('includes the latest decision review note when reviews exist', async () => {
    const admin = await signUp(context.app, 'admin@tickettout.test');
    await grantRole(context, admin.id, ROLES.ADMIN);

    const user = await signUp(context.app, 'partner-reviewed@tickettout.test');
    await grantRole(context, user.id, ROLES.PARTNER);

    const partner = await PartnerFixture.create(context.dataSource, user.id, {
      status: PartnerStatus.REFUSED,
    });

    await PartnerReviewFixture.create(
      context.dataSource,
      partner.id,
      admin.id,
      {
        fromStatus: PartnerStatus.PENDING,
        toStatus: PartnerStatus.PENDING,
        reason: 'Initial review - pending documents',
        createdAt: new Date('2026-01-01T10:00:00Z'),
      },
    );

    const latestReview = await PartnerReviewFixture.create(
      context.dataSource,
      partner.id,
      admin.id,
      {
        fromStatus: PartnerStatus.PENDING,
        toStatus: PartnerStatus.REFUSED,
        reason: 'Missing valid SIRET registration certificate',
        createdAt: new Date('2026-01-02T15:30:00Z'),
      },
    );

    const response = await getMyPartnerProfile(user.cookie).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body.status).toBe(PartnerStatus.REFUSED);
    expect(body.lastDecision).toEqual({
      reason: 'Missing valid SIRET registration certificate',
      toStatus: PartnerStatus.REFUSED,
      createdAt: latestReview.createdAt.toISOString(),
    });
  });

  it.each([PartnerStatus.PENDING, PartnerStatus.REFUSED, PartnerStatus.BANNED])(
    'allows partner with status %s to read their own dossier',
    async (status) => {
      const user = await signUp(
        context.app,
        `partner-${status}@tickettout.test`,
      );
      await grantRole(context, user.id, ROLES.PARTNER);

      await PartnerFixture.create(context.dataSource, user.id, { status });

      const response = await getMyPartnerProfile(user.cookie).expect(200);
      const body = bodyOf<PartnerProfileResponseDto>(response);

      expect(body.status).toBe(status);
    },
  );

  it('rejects unauthenticated requests with 401', async () => {
    const response = await getMyPartnerProfile().expect(401);
    const body = bodyOf<{ statusCode: number; message: string }>(response);

    expect(body).toEqual({
      statusCode: 401,
      message: 'UNAUTHENTICATED',
      error: 'Unauthorized',
    });
  });

  it.each([ROLES.EMPLOYEE, ROLES.ADMIN])(
    'rejects non-partner role %s with 403',
    async (role) => {
      const user = await signUp(context.app, `user-${role}@tickettout.test`);
      await grantRole(context, user.id, role);

      const response = await getMyPartnerProfile(user.cookie).expect(403);
      const body = bodyOf<{ statusCode: number; message: string }>(response);

      expect(body).toEqual({
        statusCode: 403,
        message: 'FORBIDDEN_ROLE',
        error: 'Forbidden',
      });
    },
  );

  it('returns 404 when the partner account has no linked partner dossier', async () => {
    const user = await signUp(context.app, 'orphan-partner@tickettout.test');
    await grantRole(context, user.id, ROLES.PARTNER);

    const response = await getMyPartnerProfile(user.cookie).expect(404);
    const body = bodyOf<{ statusCode: number; message: string }>(response);

    expect(body).toEqual({
      statusCode: 404,
      message: 'PARTNER_NOT_FOUND',
      error: 'Not Found',
    });
  });
});

describe('GET /partners/:id/profile', () => {
  it('allows an administrator to inspect any partner dossier by ID', async () => {
    const admin = await signUp(context.app, 'admin-viewer@tickettout.test');
    await grantRole(context, admin.id, ROLES.ADMIN);

    const partnerUser = await signUp(
      context.app,
      'partner-target@tickettout.test',
    );
    await grantRole(context, partnerUser.id, ROLES.PARTNER);

    const partner = await PartnerFixture.create(
      context.dataSource,
      partnerUser.id,
      {
        legalName: 'Supermarket Corp',
        tradeName: 'City Mart',
        siren: '987654321',
        businessPurpose: 'Retail grocery distribution',
        status: PartnerStatus.PENDING,
      },
    );

    const response = await getPartnerProfileById(
      partner.id,
      admin.cookie,
    ).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body).toEqual({
      id: partner.id,
      legalName: 'Supermarket Corp',
      tradeName: 'City Mart',
      siren: '987654321',
      businessPurpose: 'Retail grocery distribution',
      status: PartnerStatus.PENDING,
      addressLine: partner.addressLine,
      postalCode: partner.postalCode,
      city: partner.city,
      latitude: partner.latitude,
      longitude: partner.longitude,
      categories: [],
      lastDecision: null,
    });
  });

  it('rejects unauthenticated requests with 401', async () => {
    const response = await getPartnerProfileById(
      '0190f5c0-0000-7000-8000-000000000000',
    ).expect(401);
    const body = bodyOf<{ statusCode: number; message: string }>(response);

    expect(body).toEqual({
      statusCode: 401,
      message: 'UNAUTHENTICATED',
      error: 'Unauthorized',
    });
  });

  it.each([ROLES.PARTNER, ROLES.EMPLOYEE])(
    'rejects non-admin role %s with 403',
    async (role) => {
      const user = await signUp(context.app, `caller-${role}@tickettout.test`);
      await grantRole(context, user.id, role);

      const response = await getPartnerProfileById(
        '0190f5c0-0000-7000-8000-000000000000',
        user.cookie,
      ).expect(403);
      const body = bodyOf<{ statusCode: number; message: string }>(response);

      expect(body).toEqual({
        statusCode: 403,
        message: 'FORBIDDEN_ROLE',
        error: 'Forbidden',
      });
    },
  );

  it('returns 404 when partner ID does not exist', async () => {
    const admin = await signUp(context.app, 'admin-404@tickettout.test');
    await grantRole(context, admin.id, ROLES.ADMIN);

    const response = await getPartnerProfileById(
      '0190f5c0-0000-7000-8000-000000000000',
      admin.cookie,
    ).expect(404);
    const body = bodyOf<{ statusCode: number; message: string }>(response);

    expect(body).toEqual({
      statusCode: 404,
      message: 'PARTNER_NOT_FOUND',
      error: 'Not Found',
    });
  });

  it('returns 400 for an invalid UUID param format', async () => {
    const admin = await signUp(context.app, 'admin-uuid@tickettout.test');
    await grantRole(context, admin.id, ROLES.ADMIN);

    const response = await getPartnerProfileById(
      'invalid-uuid',
      admin.cookie,
    ).expect(400);
    const body = bodyOf<{ statusCode: number }>(response);

    expect(body.statusCode).toBe(400);
  });
});
