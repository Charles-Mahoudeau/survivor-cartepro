import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import { auth, type AuthSession } from '@/config/auth/auth';
import type { ListUsersQueryDto } from '../validators/auth.dto';

/**
 * The only place that calls `auth.api.*`.
 *
 * Same reason a repo is the only place that touches the ORM: the day a Better
 * Auth route changes shape, one file moves. Guards, controllers and scripts
 * depend on this service, never on the library instance.
 */
@Injectable()
export class AuthService {
  /**
   * Resolves the session carried by a request, or `null`.
   *
   * Node hands headers as a plain object and Better Auth wants a `Headers`, so
   * the conversion happens here rather than at each call site.
   */
  async getSession(headers: IncomingHttpHeaders): Promise<AuthSession | null> {
    return auth.api.getSession({ headers: fromNodeHeaders(headers) });
  }

  /**
   * The account list served to administrators. The library re-checks the role
   * from the session it reads out of these headers, so a caller that skipped
   * `RolesGuard` still gets refused.
   */
  async listUsers(headers: IncomingHttpHeaders, query: ListUsersQueryDto) {
    return auth.api.listUsers({
      headers: fromNodeHeaders(headers),
      query: {
        limit: query.limit,
        offset: query.offset,
        ...(query.search
          ? { searchField: 'email' as const, searchValue: query.search }
          : {}),
      },
    });
  }
}
