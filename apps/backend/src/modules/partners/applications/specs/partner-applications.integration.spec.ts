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

let context: TestApp;

const listApplications = (query = '', cookie?: string[]) => {
  const req = api(context.app).get(apiPath(`/partner-applications${query}`));
  return cookie ? req.set('Cookie', cookie) : req;
};

async function signUpAdmin() {
  const admin = await signUp(context.app, 'admin@tickettout.test');
  await grantRole(context, admin.id, ROLES.ADMIN);
  return admin;
}

type ApplicationListBody = {
  items: Array<Record<string, unknown>>;
  nextCursor: string | null;
  hasMore: boolean;
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

describe('GET /partner-applications', () => {
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
