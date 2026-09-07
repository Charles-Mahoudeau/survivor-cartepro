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

const updateMyPartnerProfile = (
  dto: Record<string, unknown>,
  cookie?: string[],
) => {
  const req = api(context.app).patch(apiPath('/partners/me/profile')).send(dto);
  return cookie ? req.set('Cookie', cookie) : req;
};

const getPartnerProfileById = (id: string, cookie?: string[]) => {
  const req = api(context.app).get(apiPath(`/partners/${id}/profile`));
  return cookie ? req.set('Cookie', cookie) : req;
};

const updatePartnerProfileById = (
  id: string,
  dto: Record<string, unknown>,
  cookie?: string[],
) => {
  const req = api(context.app)
    .patch(apiPath(`/partners/${id}/profile`))
    .send(dto);
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

describe('PATCH /partners/me/profile', () => {
  it('updates profile fields partially and returns the updated dossier', async () => {
    const category = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });
    const user = await signUp(context.app, 'partner-update@tickettout.test');
    await grantRole(context, user.id, ROLES.PARTNER);

    const partner = await PartnerFixture.create(context.dataSource, user.id, {
      legalName: 'Old Legal Name',
      tradeName: 'Old Trade Name',
      siren: '111222333',
      businessPurpose: 'Old Purpose',
      status: PartnerStatus.ACTIVE,
      addressLine: '1 Old Street',
      postalCode: '75001',
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      categories: [category],
    });

    const updatePayload = {
      tradeName: 'New Trade Name',
      addressLine: '2 New Avenue',
      city: 'Lyon',
      postalCode: '69001',
      latitude: 45.764,
      longitude: 4.8357,
    };

    const response = await updateMyPartnerProfile(
      updatePayload,
      user.cookie,
    ).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body).toEqual({
      id: partner.id,
      legalName: 'Old Legal Name',
      tradeName: 'New Trade Name',
      siren: '111222333',
      businessPurpose: 'Old Purpose',
      status: PartnerStatus.ACTIVE,
      addressLine: '2 New Avenue',
      postalCode: '69001',
      city: 'Lyon',
      latitude: 45.764,
      longitude: 4.8357,
      categories: [
        {
          slug: 'restaurant',
          displayName: 'Restaurant',
        },
      ],
      lastDecision: null,
    });
  });

  it('updates category associations when categories array is provided', async () => {
    const cat1 = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });
    await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'bakery',
      displayName: 'Bakery',
    });
    const user = await signUp(context.app, 'partner-cats@tickettout.test');
    await grantRole(context, user.id, ROLES.PARTNER);

    await PartnerFixture.create(context.dataSource, user.id, {
      categories: [cat1],
    });

    const response = await updateMyPartnerProfile(
      { categories: ['bakery'] },
      user.cookie,
    ).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body.categories).toEqual([
      {
        slug: 'bakery',
        displayName: 'Bakery',
      },
    ]);
  });

  it('clears categories when an empty array is provided', async () => {
    const cat1 = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });
    const user = await signUp(
      context.app,
      'partner-empty-cats@tickettout.test',
    );
    await grantRole(context, user.id, ROLES.PARTNER);

    await PartnerFixture.create(context.dataSource, user.id, {
      categories: [cat1],
    });

    const response = await updateMyPartnerProfile(
      { categories: [] },
      user.cookie,
    ).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body.categories).toEqual([]);
  });

  it('preserves status and review history across updates', async () => {
    const admin = await signUp(
      context.app,
      'admin-review-check@tickettout.test',
    );
    await grantRole(context, admin.id, ROLES.ADMIN);

    const user = await signUp(
      context.app,
      'partner-review-preserved@tickettout.test',
    );
    await grantRole(context, user.id, ROLES.PARTNER);

    const partner = await PartnerFixture.create(context.dataSource, user.id, {
      status: PartnerStatus.REFUSED,
    });

    const review = await PartnerReviewFixture.create(
      context.dataSource,
      partner.id,
      admin.id,
      {
        fromStatus: PartnerStatus.PENDING,
        toStatus: PartnerStatus.REFUSED,
        reason: 'Initial rejection',
      },
    );

    const response = await updateMyPartnerProfile(
      { legalName: 'Corrected Legal Name' },
      user.cookie,
    ).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body.status).toBe(PartnerStatus.REFUSED);
    expect(body.legalName).toBe('Corrected Legal Name');
    expect(body.lastDecision).toEqual({
      reason: 'Initial rejection',
      toStatus: PartnerStatus.REFUSED,
      createdAt: review.createdAt.toISOString(),
    });
  });

  it('returns 400 when invalid SIREN format is provided', async () => {
    const user = await signUp(
      context.app,
      'partner-invalid-siren@tickettout.test',
    );
    await grantRole(context, user.id, ROLES.PARTNER);
    await PartnerFixture.create(context.dataSource, user.id);

    const response = await updateMyPartnerProfile(
      { siren: '1234' },
      user.cookie,
    ).expect(400);
    const body = bodyOf<{ statusCode: number }>(response);

    expect(body.statusCode).toBe(400);
  });

  it('returns 400 when non-existent category slug is provided', async () => {
    const user = await signUp(
      context.app,
      'partner-unknown-cat@tickettout.test',
    );
    await grantRole(context, user.id, ROLES.PARTNER);
    await PartnerFixture.create(context.dataSource, user.id);

    const response = await updateMyPartnerProfile(
      { categories: ['non-existent-category'] },
      user.cookie,
    ).expect(400);
    const body = bodyOf<{ statusCode: number }>(response);

    expect(body.statusCode).toBe(400);
  });

  it('returns 400 when latitude is out of bounds', async () => {
    const user = await signUp(
      context.app,
      'partner-invalid-lat@tickettout.test',
    );
    await grantRole(context, user.id, ROLES.PARTNER);
    await PartnerFixture.create(context.dataSource, user.id);

    const response = await updateMyPartnerProfile(
      { latitude: 95.5 },
      user.cookie,
    ).expect(400);
    const body = bodyOf<{ statusCode: number }>(response);

    expect(body.statusCode).toBe(400);
  });

  it('returns 200 with unchanged profile on empty payload', async () => {
    const user = await signUp(
      context.app,
      'partner-empty-payload@tickettout.test',
    );
    await grantRole(context, user.id, ROLES.PARTNER);
    const partner = await PartnerFixture.create(context.dataSource, user.id);

    const response = await updateMyPartnerProfile({}, user.cookie).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body.id).toBe(partner.id);
    expect(body.legalName).toBe(partner.legalName);
  });

  it('rejects unauthenticated requests with 401', async () => {
    const response = await updateMyPartnerProfile({
      legalName: 'Unauthorized Update',
    }).expect(401);
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
      const user = await signUp(
        context.app,
        `caller-update-${role}@tickettout.test`,
      );
      await grantRole(context, user.id, role);

      const response = await updateMyPartnerProfile(
        { legalName: 'Forbidden' },
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

  it('returns 404 when partner account has no linked partner dossier', async () => {
    const user = await signUp(
      context.app,
      'orphan-partner-update@tickettout.test',
    );
    await grantRole(context, user.id, ROLES.PARTNER);

    const response = await updateMyPartnerProfile(
      { legalName: 'No Partner' },
      user.cookie,
    ).expect(404);
    const body = bodyOf<{ statusCode: number; message: string }>(response);

    expect(body).toEqual({
      statusCode: 404,
      message: 'PARTNER_NOT_FOUND',
      error: 'Not Found',
    });
  });
});

describe('PATCH /partners/:id/profile', () => {
  it('allows an administrator to update any partner dossier by ID', async () => {
    const admin = await signUp(context.app, 'admin-updater@tickettout.test');
    await grantRole(context, admin.id, ROLES.ADMIN);

    await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'supermarket',
      displayName: 'Supermarket',
    });

    const partnerUser = await signUp(
      context.app,
      'partner-admin-target@tickettout.test',
    );
    await grantRole(context, partnerUser.id, ROLES.PARTNER);

    const partner = await PartnerFixture.create(
      context.dataSource,
      partnerUser.id,
      {
        legalName: 'Old Supermarket',
        tradeName: 'Old City Mart',
        siren: '999888777',
        businessPurpose: 'Old Purpose',
        status: PartnerStatus.PENDING,
      },
    );

    const response = await updatePartnerProfileById(
      partner.id,
      {
        legalName: 'New Supermarket SA',
        tradeName: 'New City Mart',
        categories: ['supermarket'],
      },
      admin.cookie,
    ).expect(200);
    const body = bodyOf<PartnerProfileResponseDto>(response);

    expect(body).toEqual({
      id: partner.id,
      legalName: 'New Supermarket SA',
      tradeName: 'New City Mart',
      siren: '999888777',
      businessPurpose: 'Old Purpose',
      status: PartnerStatus.PENDING,
      addressLine: partner.addressLine,
      postalCode: partner.postalCode,
      city: partner.city,
      latitude: partner.latitude,
      longitude: partner.longitude,
      categories: [
        {
          slug: 'supermarket',
          displayName: 'Supermarket',
        },
      ],
      lastDecision: null,
    });
  });

  it('rejects unauthenticated requests with 401', async () => {
    const response = await updatePartnerProfileById(
      '0190f5c0-0000-7000-8000-000000000000',
      { legalName: 'Unauthorized' },
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
      const user = await signUp(
        context.app,
        `caller-update-by-id-${role}@tickettout.test`,
      );
      await grantRole(context, user.id, role);

      const response = await updatePartnerProfileById(
        '0190f5c0-0000-7000-8000-000000000000',
        { legalName: 'Forbidden' },
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
    const admin = await signUp(context.app, 'admin-update-404@tickettout.test');
    await grantRole(context, admin.id, ROLES.ADMIN);

    const response = await updatePartnerProfileById(
      '0190f5c0-0000-7000-8000-000000000000',
      { legalName: 'Not Found' },
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
    const admin = await signUp(
      context.app,
      'admin-update-uuid@tickettout.test',
    );
    await grantRole(context, admin.id, ROLES.ADMIN);

    const response = await updatePartnerProfileById(
      'invalid-uuid',
      { legalName: 'Invalid UUID' },
      admin.cookie,
    ).expect(400);
    const body = bodyOf<{ statusCode: number }>(response);

    expect(body.statusCode).toBe(400);
  });
});
