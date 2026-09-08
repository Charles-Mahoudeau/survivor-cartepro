import { ROLES } from '@/config/auth/auth.constants';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { AuditService } from '@/modules/audit/services';
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
    `admin-${Date.now()}-${Math.random()}@tickettout.test`,
  );
  await grantRole(context, admin.id, ROLES.ADMIN);
  return admin;
}

async function record(
  overrides: Partial<{
    action: AuditAction;
    targetType: string;
    targetId: string | null;
    actorId: string | null;
  }> = {},
) {
  const auditService = context.app.get(AuditService);
  await auditService.record({
    action: AuditAction.PARTNER_APPROVED,
    targetType: 'partner',
    targetId: 'p-1',
    actorId: null,
    actorRole: null,
    payload: null,
    ip: null,
    ...overrides,
  });
}

interface AuditEntryBody {
  id: string;
  action: AuditAction;
  targetType: string;
  targetId: string | null;
  actorId: string | null;
}

interface AuditPageBody {
  items: AuditEntryBody[];
  nextCursor: string | null;
  hasMore: boolean;
}

describe('GET /admin/audit', () => {
  it('refuses an unauthenticated caller', async () => {
    await api(context.app).get(apiPath('/admin/audit')).expect(401);
  });

  it('refuses a non-admin caller', async () => {
    const employee = await signUp(context.app, 'salarie@tickettout.test');

    await api(context.app)
      .get(apiPath('/admin/audit'))
      .set('Cookie', employee.cookie)
      .expect(403);
  });

  it('lists entries most recent first', async () => {
    const admin = await signUpAdmin();
    await record({ targetId: 'p-1' });
    await record({ targetId: 'p-2' });
    await record({ targetId: 'p-3' });

    // Scoped to PARTNER_APPROVED: signing the admin up also recorded its own
    // ACCOUNT_CREATED entry, which would otherwise sit ahead of these three.
    const response = await api(context.app)
      .get(apiPath(`/admin/audit?action=${AuditAction.PARTNER_APPROVED}`))
      .set('Cookie', admin.cookie)
      .expect(200);
    const body = bodyOf<AuditPageBody>(response);

    expect(body.items.map((item) => item.targetId)).toEqual([
      'p-3',
      'p-2',
      'p-1',
    ]);
    expect(body.hasMore).toBe(false);
  });

  it('paginates without repeating an item across pages', async () => {
    const admin = await signUpAdmin();
    for (let i = 0; i < 5; i += 1) {
      await record({ targetId: `p-${i}` });
    }

    const firstPage = bodyOf<AuditPageBody>(
      await api(context.app)
        .get(apiPath('/admin/audit?limit=2'))
        .set('Cookie', admin.cookie)
        .expect(200),
    );
    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.nextCursor).not.toBeNull();

    const secondPage = bodyOf<AuditPageBody>(
      await api(context.app)
        .get(apiPath(`/admin/audit?limit=2&cursor=${firstPage.nextCursor}`))
        .set('Cookie', admin.cookie)
        .expect(200),
    );

    const firstIds = firstPage.items.map((item) => item.id);
    const secondIds = secondPage.items.map((item) => item.id);
    expect(secondIds.some((id) => firstIds.includes(id))).toBe(false);
  });

  it('filters by action', async () => {
    const admin = await signUpAdmin();
    await record({ action: AuditAction.PARTNER_APPROVED, targetId: 'p-1' });
    await record({ action: AuditAction.PARTNER_REFUSED, targetId: 'p-2' });

    const response = await api(context.app)
      .get(apiPath(`/admin/audit?action=${AuditAction.PARTNER_REFUSED}`))
      .set('Cookie', admin.cookie)
      .expect(200);
    const body = bodyOf<AuditPageBody>(response);

    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      action: AuditAction.PARTNER_REFUSED,
      targetId: 'p-2',
    });
  });

  it('filters by actor', async () => {
    const admin = await signUpAdmin();
    const otherActor = await signUp(context.app, 'other-actor@tickettout.test');
    await record({ actorId: admin.id, targetId: 'p-1' });
    await record({ actorId: otherActor.id, targetId: 'p-2' });

    const response = await api(context.app)
      .get(apiPath(`/admin/audit?actorId=${otherActor.id}`))
      .set('Cookie', admin.cookie)
      .expect(200);
    const body = bodyOf<AuditPageBody>(response);

    expect(body.items).toHaveLength(1);
    expect(body.items[0].targetId).toBe('p-2');
  });

  it('answers 422 when the requested period starts after it ends', async () => {
    const admin = await signUpAdmin();

    await api(context.app)
      .get(
        apiPath(
          '/admin/audit?from=2026-09-08T00:00:00.000Z&to=2026-09-01T00:00:00.000Z',
        ),
      )
      .set('Cookie', admin.cookie)
      .expect(422);
  });
});
