'use server';
import { db } from '@/db';
import { vendors, vendorAssessments } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createVendorSchema, updateVendorSchema, createVendorAssessmentSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getVendors() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(vendors).where(eq(vendors.tenantId, user.tenant_id)).orderBy(desc(vendors.createdAt));
}

export async function getVendorById(id: string) {
  const user = await getCurrentUserOrDemo();
  const [vendor] = await db.select().from(vendors).where(and(eq(vendors.id, id), eq(vendors.tenantId, user.tenant_id))).limit(1);
  if (!vendor) throw new Error('Vendor not found');
  const assessments = await db.select().from(vendorAssessments).where(and(eq(vendorAssessments.vendorId, id), eq(vendorAssessments.tenantId, user.tenant_id))).orderBy(desc(vendorAssessments.assessmentDate));
  return { ...vendor, assessments };
}

export async function createVendor(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createVendorSchema.parse(data);
  const [created] = await db.insert(vendors).values({ tenantId: user.tenant_id, ...parsed }).returning();
  await logAction({ action: 'vendor.created', entity_type: 'vendor', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { name: parsed.name } });
  return created;
}

export async function updateVendor(id: string, data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = updateVendorSchema.parse(data);
  const [updated] = await db.update(vendors).set(parsed).where(and(eq(vendors.id, id), eq(vendors.tenantId, user.tenant_id))).returning();
  if (!updated) throw new Error('Vendor not found');
  await logAction({ action: 'vendor.updated', entity_type: 'vendor', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: parsed as Record<string, unknown> });
  return updated;
}

export async function createVendorAssessment(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createVendorAssessmentSchema.parse(data);
  const [created] = await db.insert(vendorAssessments).values({ tenantId: user.tenant_id, ...parsed, assessorId: user.id }).returning();
  await logAction({ action: 'vendor_assessment.created', entity_type: 'vendor_assessment', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { vendorId: parsed.vendorId } });
  return created;
}
