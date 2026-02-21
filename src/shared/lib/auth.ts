import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can fail in read-only contexts (middleware, RSC)
          }
        },
      },
    }
  );
}

export type CurrentUser = {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'risk_manager' | 'viewer' | 'auditor';
};

/**
 * Get the current authenticated user.
 * Returns null if no valid session — server actions should fall back to demo mode.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  let supabase;
  try {
    supabase = await createSupabaseServer();
  } catch {
    throw new Error('Unauthorized');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
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
