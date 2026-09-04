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
