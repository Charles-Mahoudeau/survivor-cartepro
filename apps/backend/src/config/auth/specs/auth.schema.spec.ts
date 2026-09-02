import {
  AUTH_ADMIN_SCHEMA,
  AUTH_MODEL_FIELDS,
  AUTH_RATE_LIMIT_MODEL_NAME,
} from '../auth.schema';

/**
 * These assertions are the contract between two things that must agree: the
 * columns `SnakeNamingStrategy` emits for the entities, and the columns Better
 * Auth is told to read. They are written out literally rather than recomputed,
 * so a change to `snakeCase` fails here instead of at the first sign-in.
 */
describe('auth schema mapping', () => {
  it('maps the user fields onto their columns', () => {
    expect(AUTH_MODEL_FIELDS.user).toEqual({
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  });

  it('maps the session fields onto their columns', () => {
    expect(AUTH_MODEL_FIELDS.session).toEqual({
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  });

  it('maps the account fields, tokens included', () => {
    expect(AUTH_MODEL_FIELDS.account).toMatchObject({
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
    });
  });

  it('maps the verification and rate limit fields', () => {
    expect(AUTH_MODEL_FIELDS.verification).toEqual({
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
    expect(AUTH_MODEL_FIELDS.rateLimit).toEqual({
      lastRequest: 'last_request',
    });
  });

  it('maps the columns the admin plugin adds', () => {
    expect(AUTH_ADMIN_SCHEMA).toEqual({
      user: { fields: { banReason: 'ban_reason', banExpires: 'ban_expires' } },
      session: { fields: { impersonatedBy: 'impersonated_by' } },
    });
  });

  it('renames the rate limit table too', () => {
    expect(AUTH_RATE_LIMIT_MODEL_NAME).toBe('rate_limit');
  });
});
