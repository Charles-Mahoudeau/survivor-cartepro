import 'server-only';

import { cache } from 'react';

import { getAuth } from './cookies';
import { authServerClient } from './server';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * One read per request, deduplicated inside a render by React's cache.
 *
 * Never render-cached, in any form. A private cache defaults to a five-minute
 * stale window and drops out of prefetching below thirty seconds, so there is
 * no short value without a side effect — and five minutes of cached session is
 * exactly what the API gives up a session cache to avoid: a banned account and
 * a stale role staying alive until it expires.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const auth = await getAuth();

  if (!auth.hasToken) {
    return null;
  }

  const { data, error } = await authServerClient().getSession({
    fetchOptions: { headers: auth.headers, cache: 'no-store' },
  });

  if (error || !data) {
    return null;
  }

  const { id, name, email, role } = data.user;
  return { id, name, email, role: role ?? '' };
});
