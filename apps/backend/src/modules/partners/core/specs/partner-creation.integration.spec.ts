import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { ConflictException } from '@nestjs/common';
import { grantRole, signUp } from '../../../../../test/fixtures/user.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import { ROLES } from '@/config/auth/auth.constants';
import { UserService } from '@/modules/user';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import { PartnerService } from '@/modules/partners/core/services';
import type { PartnerProfileResponseDto } from '@/modules/partners/core/dto';
import { PartnerFixture } from '@/modules/partners/core/specs/partner.fixture';
import { PartnerCategoryFixture } from '@/modules/partners/categories/specs/partner-category.fixture';

let context: TestApp;

const VALID_BODY = {
  legalName: 'My Bistro',
  tradeName: 'Bistro Chez Moi',
  siren: '552100554',
  businessPurpose: 'Restaurant',
  addressLine: '2 Rue de Paris',
  postalCode: '69001',
  city: 'Lyon',
  latitude: 45.764,
  longitude: 4.8357,
  categories: ['restaurant'],
};

const createPartner = (
  body: Record<string, unknown> = VALID_BODY,
  cookie?: string[],
) => {
  const req = api(context.app).post(apiPath('/partners')).send(body);
  return cookie ? req.set('Cookie', cookie) : req;
};

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

describe('POST /partners', () => {
  it('creates a pending dossier and promotes the caller to role partner', async () => {
    const user = await signUp(context.app, 'create-owner@tickettout.test');
    await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });

    const response = await createPartner(VALID_BODY, user.cookie).expect(201);
    const { id, ...body } = bodyOf<PartnerProfileResponseDto>(response);

    expect(typeof id).toBe('string');
    expect(body).toEqual({
      legalName: 'My Bistro',
      tradeName: 'Bistro Chez Moi',
      siren: '552100554',
      businessPurpose: 'Restaurant',
      status: PartnerStatus.PENDING,
      addressLine: '2 Rue de Paris',
      postalCode: '69001',
      city: 'Lyon',
      latitude: 45.764,
      longitude: 4.8357,
      categories: [{ slug: 'restaurant', displayName: 'Restaurant' }],
      lastDecision: null,
    });

    const partner = await context.dataSource
      .getRepository(Partner)
      .findOne({ where: { owner: { id: user.id } } });
    expect(partner).toMatchObject({ id, status: PartnerStatus.PENDING });

    const account = await context.app.get(UserService).findById(user.id);
    expect(account?.role).toBe(ROLES.PARTNER);
  });

  it('rejects an already-partner account with 403', async () => {
    const user = await signUp(context.app, 'already-partner@tickettout.test');
    await grantRole(context, user.id, ROLES.PARTNER);

    const response = await createPartner(VALID_BODY, user.cookie);

    expect(response.status).toBe(403);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('rejects an already-admin account with 403', async () => {
    const user = await signUp(context.app, 'already-admin@tickettout.test');
    await grantRole(context, user.id, ROLES.ADMIN);

    const response = await createPartner(VALID_BODY, user.cookie);

    expect(response.status).toBe(403);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'FORBIDDEN_ROLE',
    );
  });

  it('rejects a request with no session', async () => {
    await createPartner(VALID_BODY).expect(401);
  });

  it('rejects a duplicate SIREN with 409', async () => {
    const existingOwner = await signUp(
      context.app,
      'duplicate-siren-existing@tickettout.test',
    );
    await PartnerFixture.create(context.dataSource, existingOwner.id, {
      siren: '652014051',
    });
    const user = await signUp(
      context.app,
      'duplicate-siren-caller@tickettout.test',
    );
    await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });

    const response = await createPartner(
      { ...VALID_BODY, siren: '652014051' },
      user.cookie,
    );

    expect(response.status).toBe(409);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'PARTNER_SIREN_ALREADY_REGISTERED',
    );

    const partner = await context.dataSource
      .getRepository(Partner)
      .findOne({ where: { owner: { id: user.id } } });
    expect(partner).toBeNull();
    const account = await context.app.get(UserService).findById(user.id);
    expect(account?.role).toBe(ROLES.EMPLOYEE);
  });

  it('rejects a SIREN with an invalid Luhn checksum with 400', async () => {
    const user = await signUp(context.app, 'invalid-luhn@tickettout.test');

    const response = await createPartner(
      { ...VALID_BODY, siren: '123456789' },
      user.cookie,
    );

    expect(response.status).toBe(400);
  });

  it('rejects an unknown category slug with 400', async () => {
    const user = await signUp(context.app, 'unknown-category@tickettout.test');

    const response = await createPartner(
      { ...VALID_BODY, siren: '342630936', categories: ['not-a-category'] },
      user.cookie,
    );

    expect(response.status).toBe(400);
    expect(bodyOf<{ message: string }>(response).message).toBe(
      'PARTNER_CATEGORY_NOT_FOUND',
    );
  });

  it('rejects an empty categories array with 400', async () => {
    const user = await signUp(context.app, 'empty-categories@tickettout.test');

    const response = await createPartner(
      { ...VALID_BODY, siren: '751324567', categories: [] },
      user.cookie,
    );

    expect(response.status).toBe(400);
  });

  it.each(['legalName', 'addressLine'] as const)(
    'rejects a missing %s with 400',
    async (field) => {
      const user = await signUp(
        context.app,
        `missing-${field}@tickettout.test`,
      );
      const { [field]: omitted, ...body } = {
        ...VALID_BODY,
        siren: '212367882',
      };
      void omitted;

      const response = await createPartner(body, user.cookie);

      expect(response.status).toBe(400);
    },
  );

  it('lets only one of two concurrent creations from the same account succeed', async () => {
    // Calls the service directly rather than through HTTP: the RolesGuard
    // reads the caller's role fresh per request, so once the first of two
    // concurrent HTTP calls commits, the guard alone can already reject the
    // second with 403 before it reaches the transaction — a real, valid race
    // closer, but one that would make this test flaky about which layer
    // catches the second call. Bypassing it here is what reliably exercises
    // the DB-constraint branch in `translateCreationConflict` instead.
    const user = await signUp(context.app, 'concurrent@tickettout.test');
    await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });
    const partnerService = context.app.get(PartnerService);

    const results = await Promise.allSettled([
      partnerService.createForOwner(user.id, {
        ...VALID_BODY,
        siren: '732829320',
      }),
      partnerService.createForOwner(user.id, {
        ...VALID_BODY,
        siren: '790947766',
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    const reason: unknown = rejected[0].reason;
    expect(reason).toBeInstanceOf(ConflictException);
    expect((reason as ConflictException).message).toBe(
      'PARTNER_ALREADY_EXISTS',
    );

    const partners = await context.dataSource
      .getRepository(Partner)
      .find({ where: { owner: { id: user.id } } });
    expect(partners).toHaveLength(1);

    const account = await context.app.get(UserService).findById(user.id);
    expect(account?.role).toBe(ROLES.PARTNER);
  });
});
