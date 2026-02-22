'use server';

import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';

const PLAN_PRICES: Record<string, number> = { starter: 3500, pro: 5000, enterprise: 8000 };

export type BillingTenant = {
  id: string;
  name: string;
  plan: string;
  price: number;
  billingDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: string;
};

export async function getBillingData() {
  const allTenants = await db.select().from(tenants);

  const billingTenants: BillingTenant[] = allTenants.map(t => {
    // Simulate billing date as the 1st of each month based on creation
    const created = new Date(t.createdAt);
    const billingDay = 1;
    const now = new Date();
    const billingDate = new Date(now.getFullYear(), now.getMonth(), billingDay);

    // Simple payment status logic
    const daysSinceCreation = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    let paymentStatus: 'paid' | 'pending' | 'overdue' = 'paid';
    if (daysSinceCreation < 30) paymentStatus = 'pending'; // new customer, first payment pending

    return {
      id: t.id,
      name: t.name,
      plan: t.subscriptionTier,
      price: PLAN_PRICES[t.subscriptionTier] ?? 0,
      billingDate: billingDate.toISOString(),
      paymentStatus,
      createdAt: t.createdAt.toISOString(),
    };
  });

  // Revenue calculations
  const mrr = billingTenants.reduce((sum, t) => sum + t.price, 0);
  const arr = mrr * 12;
  const byPlan = {
    starter: { count: 0, revenue: 0 },
    pro: { count: 0, revenue: 0 },
    enterprise: { count: 0, revenue: 0 },
  };
  billingTenants.forEach(t => {
    const key = t.plan as keyof typeof byPlan;
    if (byPlan[key]) {
      byPlan[key].count++;
      byPlan[key].revenue += t.price;
    }
  });

  return { tenants: billingTenants, revenue: { mrr, arr, byPlan } };
}

export async function updateTenantPlan(tenantId: string, newPlan: 'starter' | 'pro' | 'enterprise') {
  await db.update(tenants)
    .set({ subscriptionTier: newPlan, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));
  return { success: true };
}
