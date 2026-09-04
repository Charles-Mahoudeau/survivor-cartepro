import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE_NAMES } from '@/lib/auth/constants';

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
