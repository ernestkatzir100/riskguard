'use server';
import { db } from '@/db';
import { tenants, users, riskOfficers, directors, notifications } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import type { CurrentUser } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { canManageUsers } from '@/shared/lib/permissions';
import { updateTenantSchema, onboardingSchema, updateRiskOfficerSchema } from '@/shared/lib/validators';
import { eq, and } from 'drizzle-orm';

export async function getTenant() {
  const user = await getCurrentUserOrDemo();
  const [tenant] = await db.select().from(tenants)
    .where(eq(tenants.id, user.tenant_id))
    .limit(1);
  if (!tenant) throw new Error('Tenant not found');
  return tenant;
}

export async function updateTenant(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateTenantSchema.parse(data);
  const [updated] = await db.update(tenants)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(tenants.id, user.tenant_id))
    .returning();
  if (!updated) throw new Error('Tenant not found');
  await logAction({
    action: 'tenant.updated',
    entity_type: 'tenant',
    entity_id: user.tenant_id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: parsed as Record<string, unknown>,
  });
  return updated;
}

export async function completeOnboarding(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = onboardingSchema.parse(data);

  // Update tenant with onboarding data
  const [updated] = await db.update(tenants)
    .set({
      name: parsed.companyName,
      companyId: parsed.companyId,
      licenseType: parsed.licenseType,
      address: parsed.address,
      city: parsed.city,
      employeeCount: parsed.employeeCount,
      portfolioSize: parsed.portfolioSize,
      clientCount: parsed.clientCount,
      clientTypes: parsed.clientTypes,
      onboardingComplete: true,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, user.tenant_id))
    .returning();

  // Create risk officer if provided
  if (parsed.riskOfficerName) {
    await db.insert(riskOfficers).values({
      tenantId: user.tenant_id,
      userId: user.id,
      fullName: parsed.riskOfficerName,
      email: parsed.riskOfficerEmail,
      roles: [],
    }).onConflictDoNothing();
  }

  // Create directors
  if (parsed.directors && parsed.directors.length > 0) {
    await db.insert(directors).values(
      parsed.directors.map((d) => ({
        tenantId: user.tenant_id,
        fullName: d.fullName,
        role: d.role,
        email: d.email,
      })),
    );
  }

  await logAction({
    action: 'tenant.onboarding_completed',
    entity_type: 'tenant',
    entity_id: user.tenant_id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { companyName: parsed.companyName },
  });

  return updated;
}

export async function getRiskOfficer() {
  const user = await getCurrentUserOrDemo();
  const [officer] = await db.select().from(riskOfficers)
    .where(eq(riskOfficers.tenantId, user.tenant_id))
    .limit(1);
  return officer ?? null;
}

export async function updateRiskOfficer(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateRiskOfficerSchema.parse(data);

  // Upsert: check if exists for tenant
  const [existing] = await db.select().from(riskOfficers)
    .where(eq(riskOfficers.tenantId, user.tenant_id))
    .limit(1);

  let result;
  if (existing) {
    const [updated] = await db.update(riskOfficers)
      .set(parsed)
      .where(and(eq(riskOfficers.id, existing.id), eq(riskOfficers.tenantId, user.tenant_id)))
      .returning();
    result = updated;
  } else {
    const [created] = await db.insert(riskOfficers).values({
      tenantId: user.tenant_id,
      userId: user.id,
      fullName: parsed.fullName ?? '',
      email: parsed.email,
      roles: parsed.roles ?? [],
      reportingLine: parsed.reportingLine,
      appointmentDate: parsed.appointmentDate,
    }).returning();
    result = created;
  }

  await logAction({
    action: existing ? 'risk_officer.updated' : 'risk_officer.created',
    entity_type: 'risk_officer',
    entity_id: result.id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: parsed as Record<string, unknown>,
  });
  return result;
}

export async function getBranding() {
  const user = await getCurrentUserOrDemo();
  const [tenant] = await db.select({
    name: tenants.name,
    logoUrl: tenants.logoUrl,
    settings: tenants.settings,
  }).from(tenants).where(eq(tenants.id, user.tenant_id)).limit(1);
  if (!tenant) return { companyName: '', logoUrl: null, brandColor: null };
  const settings = (tenant.settings ?? {}) as Record<string, unknown>;
  return {
    companyName: tenant.name || '',
    logoUrl: tenant.logoUrl || null,
    brandColor: (settings.brandColor as string) || null,
  };
}

export async function updateBranding(data: { logoUrl?: string | null; brandColor?: string | null }) {
  const user = await getCurrentUserOrDemo();
  const [current] = await db.select({ settings: tenants.settings })
    .from(tenants).where(eq(tenants.id, user.tenant_id)).limit(1);
  const settings = { ...((current?.settings ?? {}) as Record<string, unknown>) };
  if (data.brandColor !== undefined) settings.brandColor = data.brandColor;

  const updates: Record<string, unknown> = { updatedAt: new Date(), settings };
  if (data.logoUrl !== undefined) updates.logoUrl = data.logoUrl;

  const [updated] = await db.update(tenants)
    .set(updates)
    .where(eq(tenants.id, user.tenant_id))
    .returning();
  if (!updated) throw new Error('Tenant not found');
  await logAction({
    action: 'tenant.updated',
    entity_type: 'tenant',
    entity_id: user.tenant_id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { branding: true },
  });
  return { companyName: updated.name, logoUrl: updated.logoUrl, brandColor: (settings.brandColor as string) || null };
}

export async function getUsers() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(users).where(eq(users.tenantId, user.tenant_id));
}

export async function inviteUser(email: string, role: string) {
  const user = await getCurrentUserOrDemo();

  // Placeholder: actual Supabase Auth invite requires a service role key.
  // For now, create a notification for the admin to track the invite.
  const [notification] = await db.insert(notifications).values({
    tenantId: user.tenant_id,
    userId: user.id,
    type: 'user_invite',
    title: 'הזמנת משתמש חדש',
    body: `הזמנה נשלחה אל ${email} עם תפקיד ${role}`,
    entityType: 'user',
  }).returning();

  await logAction({
    action: 'user.invited',
    entity_type: 'user',
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { email, role },
  });

  return { success: true, message: `Invite placeholder created for ${email}`, notification };
}

export async function updateUserRole(targetUserId: string, newRole: CurrentUser['role']) {
  const user = await getCurrentUserOrDemo();
  if (!canManageUsers(user.role)) throw new Error('Unauthorized: only admins can change roles');
  if (targetUserId === user.id) throw new Error('Cannot change your own role');

  const [updated] = await db.update(users)
    .set({ role: newRole })
    .where(and(eq(users.id, targetUserId), eq(users.tenantId, user.tenant_id)))
    .returning();
  if (!updated) throw new Error('User not found');

  await logAction({
    action: 'user.role_changed',
    entity_type: 'user',
    entity_id: targetUserId,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { newRole, targetUser: updated.email },
  });
  return updated;
}

export async function removeUser(targetUserId: string) {
  const user = await getCurrentUserOrDemo();
  if (!canManageUsers(user.role)) throw new Error('Unauthorized: only admins can remove users');
  if (targetUserId === user.id) throw new Error('Cannot remove yourself');

  const [removed] = await db.delete(users)
    .where(and(eq(users.id, targetUserId), eq(users.tenantId, user.tenant_id)))
    .returning();
  if (!removed) throw new Error('User not found');

  await logAction({
    action: 'user.removed',
    entity_type: 'user',
    entity_id: targetUserId,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { email: removed.email },
  });
  return { success: true };
}
