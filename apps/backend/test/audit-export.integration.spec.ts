import { ROLES } from '@/config/auth/auth.constants';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';
import { AuditService } from '@/modules/audit/services';
import { verifyChain } from '@/modules/audit/services/helpers/chain-verifier.helper';
import {
  verifyAuditExportSignature,
  type SignedAuditExport,
} from '@/modules/audit/services/helpers/export-signer.helper';
import {
  closeTestApp,
  createTestApp,
  resetDatabase,
  type TestApp,
} from './app';
import { grantRole, signUp } from './fixtures/user.fixture';
import { api, apiPath, bodyOf } from './http';

let context: TestApp;
const SECRET = 'integration-audit-export-secret-at-least-32-chars';

beforeAll(async () => {
  context = await createTestApp();
});

afterAll(async () => {
  await closeTestApp(context);
});

beforeEach(async () => {
  await resetDatabase();
});

async function signUpAdmin() {
  const admin = await signUp(
    context.app,
    `admin-${Date.now()}-${Math.random()}@tickettout.test`,
  );
  await grantRole(context, admin.id, ROLES.ADMIN);
  return admin;
}

async function seedPartnerEntries(count: number): Promise<void> {
  const auditService = context.app.get(AuditService);
  for (let i = 0; i < count; i += 1) {
    await auditService.record({
      action: AuditAction.PARTNER_APPROVED,
      targetType: 'partner',
      targetId: `p-${i}`,
      actorId: null,
      actorRole: null,
      payload: null,
      ip: null,
    });
  }
}

describe('GET /admin/audit/export', () => {
  it('refuses an unauthenticated caller', async () => {
    await api(context.app).get(apiPath('/admin/audit/export')).expect(401);
  });

  it('refuses a non-admin caller', async () => {
    const employee = await signUp(context.app, 'salarie@tickettout.test');

    await api(context.app)
      .get(apiPath('/admin/audit/export'))
      .set('Cookie', employee.cookie)
      .expect(403);
  });

  it('exports a signed, chain-intact snapshot verifiable without the database', async () => {
    const admin = await signUpAdmin();
    await seedPartnerEntries(3);

    const response = await api(context.app)
      .get(apiPath('/admin/audit/export'))
      .set('Cookie', admin.cookie)
      .expect(200);
    const signed = bodyOf<SignedAuditExport>(response);

    // The ACCOUNT_CREATED entry from signing the admin up is legitimately
    // in the window too — the export holds the whole period, unfiltered.
    expect(signed.entries.length).toBeGreaterThanOrEqual(3);
    expect(signed.chainDigest).toBe(signed.entries.at(-1)?.hash);

    expect(verifyAuditExportSignature(signed, SECRET)).toBe(true);

    const firstPreviousHash = signed.entries[0]?.previousHash ?? null;
    expect(verifyChain(signed.entries, firstPreviousHash)).toEqual({
      ok: true,
      checked: signed.entries.length,
      anomalies: [],
    });
  });

  it('rejects the signature once a single field is edited after export', async () => {
    const admin = await signUpAdmin();
    await seedPartnerEntries(2);

    const response = await api(context.app)
      .get(apiPath('/admin/audit/export'))
      .set('Cookie', admin.cookie)
      .expect(200);
    const signed = bodyOf<SignedAuditExport>(response);

    const tampered: SignedAuditExport = {
      ...signed,
      entries: signed.entries.map((entry, index) =>
        index === 0 ? { ...entry, targetId: 'forged' } : entry,
      ),
    };

    expect(verifyAuditExportSignature(tampered, SECRET)).toBe(false);
  });

  it('answers 422 when the requested period starts after it ends', async () => {
    const admin = await signUpAdmin();

    await api(context.app)
      .get(
        apiPath(
          '/admin/audit/export?from=2026-09-08T00:00:00.000Z&to=2026-09-01T00:00:00.000Z',
        ),
      )
      .set('Cookie', admin.cookie)
      .expect(422);
  });

  it('exports an empty period with a null digest, still validly signed', async () => {
    const admin = await signUpAdmin();

    const response = await api(context.app)
      .get(
        apiPath(
          '/admin/audit/export?from=2020-01-01T00:00:00.000Z&to=2020-01-02T00:00:00.000Z',
        ),
      )
      .set('Cookie', admin.cookie)
      .expect(200);
    const signed = bodyOf<SignedAuditExport>(response);

    expect(signed.entries).toEqual([]);
    expect(signed.chainDigest).toBeNull();
    expect(verifyAuditExportSignature(signed, SECRET)).toBe(true);
  });
});
