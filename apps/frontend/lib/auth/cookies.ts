import 'server-only';

import { cookies, headers } from 'next/headers';

import { appOrigin } from '@/lib/env';
import { SESSION_COOKIE_NAMES } from './constants';

export interface ForwardedAuth {
  hasToken: boolean;
  headers: Headers;
}

export async function getAuth(): Promise<ForwardedAuth> {
  const store = await cookies();
  const incoming = await headers();

  const present: Array<[string, string]> = [];
  for (const name of SESSION_COOKIE_NAMES) {
    const value = store.get(name)?.value;
    if (value !== undefined) {
      present.push([name, value]);
    }
  }

  const forwarded = new Headers();
  forwarded.set('origin', appOrigin());

  if (present.length > 0) {
    forwarded.set(
      'cookie',
      present.map(([name, value]) => `${name}=${value}`).join('; '),
    );
  }

  const clientAddress = incoming.get('x-forwarded-for');
  if (clientAddress) {
    forwarded.set('x-forwarded-for', clientAddress);
  }

  return { hasToken: present.length > 0, headers: forwarded };
}
