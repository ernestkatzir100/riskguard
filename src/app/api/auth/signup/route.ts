import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { tenants, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { setSessionCookie } from '@/shared/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, companyName } = await request.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json({ error: 'כל השדות נדרשים' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, { status: 400 });
    }

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: 'כתובת האימייל כבר רשומה במערכת' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create tenant
    const [tenant] = await db.insert(tenants).values({
      name: companyName,
    }).returning();

    // Create user
    const [user] = await db.insert(users).values({
      tenantId: tenant.id,
      email: email.toLowerCase().trim(),
      fullName,
      passwordHash,
      role: 'admin',
    }).returning();

    // Set session cookie
    await setSessionCookie(user.id);

    return NextResponse.json({ tenantId: tenant.id });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת החשבון' }, { status: 500 });
  }
}
