import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants, users } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const { userId, email, fullName, companyName } = await request.json();

    if (!userId || !email || !fullName || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create tenant
    const [tenant] = await db.insert(tenants).values({
      name: companyName,
    }).returning();

    // Create user linked to tenant
    await db.insert(users).values({
      id: userId,
      tenantId: tenant.id,
      email,
      fullName,
      role: 'admin',
    });

    return NextResponse.json({ tenantId: tenant.id });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
