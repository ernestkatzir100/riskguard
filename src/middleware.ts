import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /en and /en/* to /he equivalent
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPath = pathname.replace(/^\/en/, '/he') || '/he';
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(he|en)/:path*'],
};
