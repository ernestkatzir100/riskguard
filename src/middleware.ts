import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /en to /he
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPath = pathname.replace(/^\/en/, '/he') || '/he';
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Allow all routes through — auth is handled at the server action level.
  // Pages render with demo data fallback when no session exists.
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(he|en)/:path*'],
};
