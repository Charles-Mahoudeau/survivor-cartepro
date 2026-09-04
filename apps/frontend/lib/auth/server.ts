import 'server-only';

import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

import { backendInternalUrl } from '@/lib/env';
import { AUTH_BASE_PATH } from './constants';

function build() {
  return createAuthClient({
    baseURL: backendInternalUrl(),
    basePath: AUTH_BASE_PATH,
    plugins: [adminClient()],
  });
}

let cached: ReturnType<typeof build> | null = null;

export function authServerClient(): ReturnType<typeof build> {
  cached ??= build();
  return cached;
}
