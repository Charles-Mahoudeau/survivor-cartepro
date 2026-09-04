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

/**
 * The server-side client, for reads a component makes and writes an action makes.
 *
 * It needs an explicit baseURL where the browser client needs none: the
 * container resolves no public hostname, and outside a browser the client falls
 * back to the relative '/api/auth', which fetch refuses.
 *
 * Built on first call rather than at import: the address is a runtime value, and
 * reading it while the bundle is being built would fail the build on a machine
 * that has no reason to know where the API lives.
 */
export function authServerClient(): ReturnType<typeof build> {
  cached ??= build();
  return cached;
}
