import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ['/login', '/signup', '/api/'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.includes(p));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /en to /he
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPath = pathname.replace(/^\/en/, '/he') || '/he';
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Skip auth check for public paths and API routes
  if (isPublicPath(pathname)) {
    return intlMiddleware(request);
  }

  // Check Supabase session for dashboard routes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // No Supabase configured — allow through (dev mode)
    return intlMiddleware(request);
  }

  const response = intlMiddleware(request);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // If no session and trying to access dashboard, redirect to login
  if (!user && pathname.match(/^\/(he|en)\//)) {
    const loginUrl = new URL('/he/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/', '/(he|en)/:path*'],
};
