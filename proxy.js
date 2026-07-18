import { NextResponse } from 'next/server';
import { DEMO_ACCOUNTS, SESSION_COOKIE } from './lib/constants';

const PUBLIC_PATHS = ['/', '/login', '/complaint'];

function readValidSession(request) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw || !DEMO_ACCOUNTS[raw]) return { raw, session: null };
  return { raw, session: raw };
}

function clearSessionCookie(response) {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const { raw, session } = readValidSession(request);

  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    // Drop stale/unknown role cookies (e.g. pre-collapse agent/branch) so
    // proxy and getSession agree and we don't bounce login ↔ dashboard.
    if (raw) return clearSessionCookie(response);
    return response;
  }

  if (session && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (raw && !session) {
    return clearSessionCookie(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/).*)'],
};
