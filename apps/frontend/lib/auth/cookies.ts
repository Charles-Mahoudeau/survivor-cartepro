import 'server-only';

import { cookies, headers } from 'next/headers';

import { appOrigin } from '@/lib/env';
import { SESSION_COOKIE_NAMES } from './constants';

export interface ForwardedAuth {
  hasToken: boolean;
  headers: Headers;
}

/**
 * Rebuilds the three headers the auth handler reads off a browser request: the
 * session cookie, the origin its CSRF check compares against, and the address
 * its rate limiter keys on. A server-side call carries none of them by itself.
 *
 * The origin is set even on reads, where it is ignored: the handler skips the
 * check on GET, but any write that carries a cookie is refused without it, and
 * a helper that branches is a helper whose missing branch is found in production.
 *
 * Forwarding the client address matters because the limiter falls back to a
 * single shared bucket when it cannot resolve one, which would turn five failed
 * attempts into a lockout for everybody.
 */
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
