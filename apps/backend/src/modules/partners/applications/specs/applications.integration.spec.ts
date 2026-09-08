import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from '../../../../../test/app';
import { grantRole, signUp } from '../../../../../test/fixtures/user.fixture';
import { api, apiPath, bodyOf } from '../../../../../test/http';
import { ROLES } from '@/config/auth/auth.constants';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import { PartnerFixture } from '@/modules/partners/core/specs/partner.fixture';
import { PartnerCategoryFixture } from '@/modules/partners/categories/specs/partner-category.fixture';
import { Application } from '@/modules/partners/applications/entities/application.entity';

let context: TestApp;

const listApplications = (query = '', cookie?: string[]) => {
  const req = api(context.app).get(apiPath(`/partners/applications${query}`));
  return cookie ? req.set('Cookie', cookie) : req;
};

const getApplication = (id: string, cookie?: string[]) => {
  const req = api(context.app).get(apiPath(`/partners/applications/${id}`));
  return cookie ? req.set('Cookie', cookie) : req;
};

const getMyApplication = (cookie?: string[]) => {
  const req = api(context.app).get(apiPath('/partners/applications/me'));
  return cookie ? req.set('Cookie', cookie) : req;
};

const approveApplication = (
  id: string,
  body: Record<string, unknown> = { reason: 'Dossier complet et vérifié' },
  cookie?: string[],
) => {
  const req = api(context.app)
    .post(apiPath(`/partners/applications/${id}/approve`))
    .send(body);
  return cookie ? req.set('Cookie', cookie) : req;
};

async function signUpAdmin() {
  const admin = await signUp(context.app, 'admin@tickettout.test');
  await grantRole(context, admin.id, ROLES.ADMIN);
  return admin;
}

async function signUpPartner(email: string) {
  const partner = await signUp(context.app, email);
  await grantRole(context, partner.id, ROLES.PARTNER);
  return partner;
}

type ApplicationListBody = {
  items: Array<Record<string, unknown>>;
  nextCursor: string | null;
  hasMore: boolean;
};

type ApplicationDetailBody = {
  id: string;
  legalName: string;
  tradeName: string;
  siren: string;
  businessPurpose: string;
  status: string;
  addressLine: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: Array<{ slug: string; displayName: string }>;
  owner: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
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

describe('GET /partners/applications', () => {
  it('defaults to the pending review queue', async () => {
    const admin = await signUpAdmin();
    const pendingOwner = await signUp(
      context.app,
      'pending-owner@tickettout.test',
    );
    const pending = await PartnerFixture.create(
      context.dataSource,
      pendingOwner.id,
      { status: PartnerStatus.PENDING },
    );
    const activeOwner = await signUp(
      context.app,
      'active-owner@tickettout.test',
    );
    await PartnerFixture.create(context.dataSource, activeOwner.id, {
      status: PartnerStatus.ACTIVE,
    });

    const response = await listApplications('', admin.cookie).expect(200);
    const body = bodyOf<ApplicationListBody>(response);

    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: pending.id,
      status: PartnerStatus.PENDING,
    });
  });

  it('filters the queue by an explicit status', async () => {
    const admin = await signUpAdmin();
    const bannedOwner = await signUp(
      context.app,
      'banned-owner@tickettout.test',
    );
    const banned = await PartnerFixture.create(
      context.dataSource,
      bannedOwner.id,
      { status: PartnerStatus.BANNED },
    );
    const pendingOwner = await signUp(
      context.app,
      'other-pending-owner@tickettout.test',
    );
    await PartnerFixture.create(context.dataSource, pendingOwner.id, {
      status: PartnerStatus.PENDING,
    });

    const response = await listApplications(
      `?status=${PartnerStatus.BANNED}`,
      admin.cookie,
    ).expect(200);
    const body = bodyOf<ApplicationListBody>(response);

    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ id: banned.id });
  });

  it('returns the review-queue projection of a partner', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(context.app, 'shape-owner@tickettout.test');
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      legalName: 'Supermarket Corp',
      tradeName: 'City Mart',
      siren: '123456789',
      city: 'Lyon',
      status: PartnerStatus.PENDING,
    });

    const response = await listApplications('', admin.cookie).expect(200);
    const body = bodyOf<ApplicationListBody>(response);

    expect(body.items[0]).toEqual({
      id: partner.id,
      legalName: 'Supermarket Corp',
      tradeName: 'City Mart',
      siren: '123456789',
      city: 'Lyon',
      status: PartnerStatus.PENDING,
      createdAt: partner.createdAt.toISOString(),
    });
  });

  it('rejects an unknown status value with 400', async () => {
    const admin = await signUpAdmin();

    const response = await listApplications(
      '?status=not-a-status',
      admin.cookie,
    );

    expect(response.status).toBe(400);
  });

  it('rejects a request with no session', async () => {
    await listApplications().expect(401);
  });

  it.each([ROLES.PARTNER, ROLES.EMPLOYEE])(
    'rejects the %s role',
    async (role) => {
      const user = await signUp(context.app, `caller-${role}@tickettout.test`);
      await grantRole(context, user.id, role);

      const response = await listApplications('', user.cookie);

      expect(response.status).toBe(403);
      expect(bodyOf<{ message: string }>(response).message).toBe(
        'FORBIDDEN_ROLE',
      );
    },
  );
});

describe('GET /partners/applications/:id', () => {
  it('returns the full dossier detail for an admin', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(context.app, 'detail-owner@tickettout.test');
    const category = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'bakery',
      displayName: 'Bakery',
    });
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      legalName: 'Supermarket Corp',
      tradeName: 'City Mart',
      siren: '123456789',
      businessPurpose: 'Grocery retail',
      status: PartnerStatus.PENDING,
      addressLine: '1 Test Street',
      postalCode: '75001',
      city: 'Lyon',
      latitude: 45.764,
      longitude: 4.8357,
      categories: [category],
    });

    const response = await getApplication(partner.id, admin.cookie).expect(200);
    const body = bodyOf<ApplicationDetailBody>(response);

    expect(body).toEqual({
      id: partner.id,
      legalName: 'Supermarket Corp',
      tradeName: 'City Mart',
      siren: '123456789',
      businessPurpose: 'Grocery retail',
      status: PartnerStatus.PENDING,
      addressLine: '1 Test Street',
      postalCode: '75001',
      city: 'Lyon',
      latitude: 45.764,
      longitude: 4.8357,
      categories: [{ slug: 'bakery', displayName: 'Bakery' }],
      owner: { id: owner.id, name: 'Compte de test', email: owner.email },
      createdAt: partner.createdAt.toISOString(),
      updatedAt: partner.updatedAt.toISOString(),
    });
  });

  it('returns 404 for an unknown id', async () => {
    const admin = await signUpAdmin();

    const response = await getApplication(
      '00000000-0000-7000-8000-000000000000',
      admin.cookie,
    );

    expect(response.status).toBe(404);
  });

  it.each([ROLES.PARTNER, ROLES.EMPLOYEE])(
    'rejects the %s role',
    async (role) => {
      const owner = await signUp(
        context.app,
        `detail-forbidden-owner-${role}@tickettout.test`,
      );
      const partner = await PartnerFixture.create(context.dataSource, owner.id);
      const user = await signUp(
        context.app,
        `detail-caller-${role}@tickettout.test`,
      );
      await grantRole(context, user.id, role);

      const response = await getApplication(partner.id, user.cookie);

      expect(response.status).toBe(403);
      expect(bodyOf<{ message: string }>(response).message).toBe(
        'FORBIDDEN_ROLE',
      );
    },
  );

  it('rejects a request with no session', async () => {
    const owner = await signUp(
      context.app,
      'detail-anon-owner@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id);

    await getApplication(partner.id).expect(401);
  });
});

describe('GET /partners/applications/me', () => {
  it("returns the caller's own dossier detail", async () => {
    const owner = await signUpPartner('me-owner@tickettout.test');
    const category = await PartnerCategoryFixture.create(context.dataSource, {
      slug: 'restaurant',
      displayName: 'Restaurant',
    });
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      legalName: 'My Bistro',
      tradeName: 'Bistro Chez Moi',
      siren: '987654321',
      businessPurpose: 'Restaurant',
      status: PartnerStatus.PENDING,
      addressLine: '2 Rue de Paris',
      postalCode: '69001',
      city: 'Lyon',
      latitude: 45.764,
      longitude: 4.8357,
      categories: [category],
    });
    const otherOwner = await signUpPartner('me-other-owner@tickettout.test');
    await PartnerFixture.create(context.dataSource, otherOwner.id);

    const response = await getMyApplication(owner.cookie).expect(200);
    const body = bodyOf<ApplicationDetailBody>(response);

    expect(body).toEqual({
      id: partner.id,
      legalName: 'My Bistro',
      tradeName: 'Bistro Chez Moi',
      siren: '987654321',
      businessPurpose: 'Restaurant',
      status: PartnerStatus.PENDING,
      addressLine: '2 Rue de Paris',
      postalCode: '69001',
      city: 'Lyon',
      latitude: 45.764,
      longitude: 4.8357,
      categories: [{ slug: 'restaurant', displayName: 'Restaurant' }],
      owner: { id: owner.id, name: 'Compte de test', email: owner.email },
      createdAt: partner.createdAt.toISOString(),
      updatedAt: partner.updatedAt.toISOString(),
    });
  });

  it('returns 404 for a partner account with no dossier', async () => {
    const partner = await signUpPartner('me-no-dossier@tickettout.test');

    const response = await getMyApplication(partner.cookie);

    expect(response.status).toBe(404);
  });

  it.each([ROLES.ADMIN, ROLES.EMPLOYEE])(
    'rejects the %s role',
    async (role) => {
      const user = await signUp(
        context.app,
        `me-caller-${role}@tickettout.test`,
      );
      await grantRole(context, user.id, role);

      const response = await getMyApplication(user.cookie);

      expect(response.status).toBe(403);
      expect(bodyOf<{ message: string }>(response).message).toBe(
        'FORBIDDEN_ROLE',
      );
    },
  );

  it('rejects a request with no session', async () => {
    await getMyApplication().expect(401);
  });
});

describe('POST /partners/applications/:id/approve', () => {
  it('approves a pending application and activates the partner', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(context.app, 'approve-owner@tickettout.test');
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });

    const response = await approveApplication(
      partner.id,
      { reason: 'Dossier complet et vérifié' },
      admin.cookie,
    ).expect(201);
    const body = bodyOf<ApplicationDetailBody>(response);

    expect(body.status).toBe(PartnerStatus.ACTIVE);

    const decision = await context.dataSource
      .getRepository(Application)
      .findOne({
        where: { partner: { id: partner.id } },
        relations: { partner: true, decidedBy: true },
      });

    expect(decision).toMatchObject({
      fromStatus: PartnerStatus.PENDING,
      toStatus: PartnerStatus.ACTIVE,
      reason: 'Dossier complet et vérifié',
    });
    expect(decision?.decidedBy.id).toBe(admin.id);
  });

  it('rejects a missing reason with 400', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(
      context.app,
      'approve-no-reason@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });

    const response = await approveApplication(partner.id, {}, admin.cookie);

    expect(response.status).toBe(400);
  });

  it('returns 404 for an unknown id', async () => {
    const admin = await signUpAdmin();

    const response = await approveApplication(
      '00000000-0000-7000-8000-000000000000',
      undefined,
      admin.cookie,
    );

    expect(response.status).toBe(404);
  });

  it.each([PartnerStatus.ACTIVE, PartnerStatus.REFUSED, PartnerStatus.BANNED])(
    'rejects approving an already-%s partner with 409',
    async (status) => {
      const admin = await signUpAdmin();
      const owner = await signUp(
        context.app,
        `approve-${status}-owner@tickettout.test`,
      );
      const partner = await PartnerFixture.create(
        context.dataSource,
        owner.id,
        { status },
      );

      const response = await approveApplication(
        partner.id,
        undefined,
        admin.cookie,
      );

      expect(response.status).toBe(409);
      expect(bodyOf<{ message: string }>(response).message).toBe(
        'PARTNER_NOT_PENDING',
      );
    },
  );

  it('lets only one of two concurrent approvals succeed', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(
      context.app,
      'approve-concurrent-owner@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });

    const [first, second] = await Promise.all([
      approveApplication(partner.id, undefined, admin.cookie),
      approveApplication(partner.id, undefined, admin.cookie),
    ]);

    expect([first.status, second.status].sort()).toEqual([201, 409]);
  });

  it.each([ROLES.PARTNER, ROLES.EMPLOYEE])(
    'rejects the %s role',
    async (role) => {
      const owner = await signUp(
        context.app,
        `approve-forbidden-owner-${role}@tickettout.test`,
      );
      const partner = await PartnerFixture.create(
        context.dataSource,
        owner.id,
        { status: PartnerStatus.PENDING },
      );
      const user = await signUp(
        context.app,
        `approve-caller-${role}@tickettout.test`,
      );
      await grantRole(context, user.id, role);

      const response = await approveApplication(
        partner.id,
        undefined,
        user.cookie,
      );

      expect(response.status).toBe(403);
      expect(bodyOf<{ message: string }>(response).message).toBe(
        'FORBIDDEN_ROLE',
      );
    },
  );

  it('rejects a request with no session', async () => {
    const owner = await signUp(
      context.app,
      'approve-anon-owner@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });

    await approveApplication(partner.id).expect(401);
  });
});

describe('partner_review immutability', () => {
  it('rejects a blank reason at the database level', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(
      context.app,
      'immutable-blank-owner@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });
    const applications = context.dataSource.getRepository(Application);
    const entry = applications.create({
      partner: { id: partner.id },
      fromStatus: PartnerStatus.PENDING,
      toStatus: PartnerStatus.ACTIVE,
      reason: '   ',
      decidedBy: { id: admin.id },
    });

    await expect(applications.save(entry)).rejects.toThrow(
      /violates check constraint "CHK_partner_review_reason_not_blank"/,
    );
  });

  it('rejects updating an existing decision at the database level', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(
      context.app,
      'immutable-update-owner@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });
    await approveApplication(
      partner.id,
      { reason: 'Dossier complet et vérifié' },
      admin.cookie,
    ).expect(201);
    const applications = context.dataSource.getRepository(Application);
    const decision = await applications.findOneOrFail({
      where: { partner: { id: partner.id } },
    });

    await expect(
      applications.update({ id: decision.id }, { reason: 'mutated' }),
    ).rejects.toThrow(
      /Immutable table "partner_review" cannot be mutated with UPDATE/,
    );
  });

  it('rejects deleting an existing decision at the database level', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(
      context.app,
      'immutable-delete-owner@tickettout.test',
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });
    await approveApplication(
      partner.id,
      { reason: 'Dossier complet et vérifié' },
      admin.cookie,
    ).expect(201);
    const applications = context.dataSource.getRepository(Application);
    const decision = await applications.findOneOrFail({
      where: { partner: { id: partner.id } },
    });

    await expect(applications.delete({ id: decision.id })).rejects.toThrow(
      /Immutable table "partner_review" cannot be mutated with DELETE/,
    );
  });
});
