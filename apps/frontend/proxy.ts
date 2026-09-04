import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE_NAMES } from '@/lib/auth/constants';

/**
 * Presence of the session cookie, nothing more. Validating here would put a
 * database round-trip in front of every request to a protected space, and the
 * API re-validates on every call anyway. The role is checked in each space's
 * layout, where a slow read is allowed to stream.
 */
export function proxy(request: NextRequest) {
  const carriesToken = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );

  if (carriesToken) {
    return NextResponse.next();
  }

  const login = new URL('/login', request.url);
  login.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/me/:path*', '/pro/:path*', '/admin/:path*'],
};
