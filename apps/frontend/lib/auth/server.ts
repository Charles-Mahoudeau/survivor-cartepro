import 'server-only';

import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

import { backendInternalUrl } from '@/lib/env';
import { AUTH_BASE_PATH } from './constants';

export function authServerClient() {
  return createAuthClient({
    baseURL: backendInternalUrl(),
    basePath: AUTH_BASE_PATH,
    plugins: [adminClient()],
  });
}
