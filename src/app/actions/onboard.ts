'use server';

import { db } from '@/db';
import { tenants, users } from '@/db/schema';
import { sendEmail } from './email';
import crypto from 'crypto';

export async function createCustomer(data: {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  plan: 'starter' | 'pro' | 'enterprise';
}) {
  // Create tenant
  const [tenant] = await db.insert(tenants).values({
    name: data.companyName,
    subscriptionTier: data.plan,
    onboardingComplete: false,
  }).returning();

  // Create admin user for the tenant (generate a UUID for user ID)
  const userId = crypto.randomUUID();
  await db.insert(users).values({
    id: userId,
    tenantId: tenant.id,
    email: data.contactEmail,
    fullName: data.contactName,
    phone: data.contactPhone,
    role: 'admin',
  });

  // Send welcome email via Resend
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://riskguard.co.il';
  await sendEmail(
    data.contactEmail,
    `ברוכים הבאים ל-RiskGuard — ${data.companyName}`,
    `<div dir="rtl" style="font-family: Assistant, Rubik, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #B8C4D1; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1D6FAB, #0E9AAA); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; font-size: 20px; margin: 0;">RiskGuard</h1>
      </div>
      <div style="padding: 24px; background: white;">
        <p>שלום ${data.contactName},</p>
        <p>חשבון RiskGuard שלך עבור <strong>${data.companyName}</strong> מוכן.</p>
        <p>תוכנית: <strong>${data.plan === 'starter' ? 'Starter' : data.plan === 'pro' ? 'Pro' : 'Enterprise'}</strong></p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${siteUrl}/he/signup" style="background: linear-gradient(135deg, #1360A6, #0B8A99); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            הירשם והתחל
          </a>
        </div>
      </div>
      <div style="padding: 12px 24px; background: #EDF0F5; font-size: 11px; color: #576B82; text-align: center;">
        RiskGuard \u2014 \u05E0\u05D9\u05D4\u05D5\u05DC \u05E1\u05D9\u05DB\u05D5\u05E0\u05D9\u05DD \u05D7\u05DB\u05DD
      </div>
    </div>`,
  );

  return { tenantId: tenant.id, userId };
}
