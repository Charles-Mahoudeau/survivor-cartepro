import { ROLES } from '@/config/auth/auth.constants';
import { Audit } from '@/modules/audit/entities';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import { PartnerFixture } from '@/modules/partners/core/specs/partner.fixture';
import { AllocationCampaignFixture } from '@/modules/allocations/specs/allocation-campaign.fixture';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from './app';
import { grantRole, signUp } from './fixtures/user.fixture';
import { api, apiPath, bodyOf } from './http';

let context: TestApp;

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase(context);
});

async function signUpAdmin() {
  const admin = await signUp(
    context.app,
    `admin-${Date.now()}@tickettout.test`,
  );
  await grantRole(context, admin.id, ROLES.ADMIN);
  return admin;
}

/**
 * The interceptor fires the write without awaiting it, so the response can
 * come back before the row lands. Polling is the honest way to wait for a
 * fire-and-forget side effect instead of guessing a fixed delay.
 */
async function waitForAuditEntry(
  targetType: string,
  targetId: string,
  timeoutMs = 2000,
): Promise<Audit> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const row = await context.dataSource
      .getRepository(Audit)
      .findOne({ where: { targetType, targetId } });
    if (row) {
      return row;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(
    `no audit_log row appeared for ${targetType}/${targetId} in time`,
  );
}

describe('POST /allocations/:id/apply', () => {
  it('records ALLOCATION_APPLIED, targeting the allocation', async () => {
    const { agent, allocation } = await AllocationCampaignFixture.create(
      context,
      { active: 1, disabled: 0 },
    );

    await api(context.app)
      .post(apiPath(`/allocations/${allocation.id}/apply`))
      .set('Cookie', agent.cookie)
      .expect(200);

    const entry = await waitForAuditEntry('allocation', allocation.id);
    expect(entry).toMatchObject({
      action: AuditAction.ALLOCATION_APPLIED,
      targetType: 'allocation',
      targetId: allocation.id,
      actorId: agent.id,
    });
  });
});

describe('POST /employers', () => {
  it('records ADMIN_ACTION, targeting the id in the response', async () => {
    const admin = await signUpAdmin();

    const response = await api(context.app)
      .post(apiPath('/employers'))
      .set('Cookie', admin.cookie)
      .send({ name: 'Acme', siren: '123456789' })
      .expect(201);
    const { id } = bodyOf<{ id: string }>(response);

    const entry = await waitForAuditEntry('employer', id);
    expect(entry).toMatchObject({
      action: AuditAction.ADMIN_ACTION,
      targetType: 'employer',
      targetId: id,
      actorId: admin.id,
    });
  });
});

describe('POST /partners/applications/:id/decision', () => {
  it('records PARTNER_APPROVED when the decision is approved', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(
      context.app,
      `owner-${Date.now()}@tickettout.test`,
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });

    await api(context.app)
      .post(apiPath(`/partners/applications/${partner.id}/decision`))
      .set('Cookie', admin.cookie)
      .send({ decision: 'approved', reason: 'Dossier complet et vérifié' })
      .expect(201);

    const entry = await waitForAuditEntry('partner', partner.id);
    expect(entry).toMatchObject({
      action: AuditAction.PARTNER_APPROVED,
      targetType: 'partner',
      targetId: partner.id,
      actorId: admin.id,
    });
  });

  it('records PARTNER_REFUSED when the decision is refused', async () => {
    const admin = await signUpAdmin();
    const owner = await signUp(
      context.app,
      `owner-${Date.now()}@tickettout.test`,
    );
    const partner = await PartnerFixture.create(context.dataSource, owner.id, {
      status: PartnerStatus.PENDING,
    });

    await api(context.app)
      .post(apiPath(`/partners/applications/${partner.id}/decision`))
      .set('Cookie', admin.cookie)
      .send({ decision: 'refused', reason: 'Dossier incomplet' })
      .expect(201);

    const entry = await waitForAuditEntry('partner', partner.id);
    expect(entry).toMatchObject({
      action: AuditAction.PARTNER_REFUSED,
      targetType: 'partner',
      targetId: partner.id,
      actorId: admin.id,
    });
  });
});
