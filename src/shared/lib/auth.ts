import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');
const COOKIE_NAME = 'rg-session';

export type CurrentUser = {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'risk_manager' | 'viewer' | 'auditor';
  is_super_admin: boolean;
};

/**
 * Create a signed JWT for the given user ID.
 */
export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

/**
 * Set the session cookie after login/signup.
 */
export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Clear the session cookie on logout.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Get the current authenticated user.
 * Returns null if no valid session — server actions should fall back to demo mode.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  let payload;
  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch {
    throw new Error('Unauthorized');
  }

  const userId = payload.sub;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!dbUser) {
    throw new Error('User not found in database');
  }

  return {
    id: dbUser.id,
    tenant_id: dbUser.tenantId,
    email: dbUser.email,
    full_name: dbUser.fullName,
    role: dbUser.role,
    is_super_admin: dbUser.isSuperAdmin,
  };
}

/**
 * Demo/fallback user for unauthenticated browsing.
 * Used when getCurrentUser() throws and the action needs tenant context.
 */
export const DEMO_USER: CurrentUser = {
  id: '00000000-0000-0000-0000-000000000001',
  tenant_id: '', // filled at runtime from first tenant
  email: 'demo@riskguard.co.il',
  full_name: 'דוד כהן',
  role: 'admin',
  is_super_admin: false,
};

/**
 * Get current user or fall back to demo user for unauthenticated browsing.
 * This allows pages to load with real DB data even without login.
 */
export async function getCurrentUserOrDemo(): Promise<CurrentUser> {
  try {
    return await getCurrentUser();
  } catch {
    // Fallback: get the first tenant from DB for demo mode
    const { tenants } = await import('@/db/schema');
    const [tenant] = await db.select().from(tenants).limit(1);
    if (tenant) {
      return { ...DEMO_USER, tenant_id: tenant.id };
    }
    throw new Error('No tenant found for demo mode');
  }
}
