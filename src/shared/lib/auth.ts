import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
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

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createSupabaseServer();
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
