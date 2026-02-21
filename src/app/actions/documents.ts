'use server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { getCurrentUser, createSupabaseServer } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createDocumentSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getDocuments(filters?: { type?: string; module?: string; status?: string }) {
  const user = await getCurrentUser();
  const results = await db.select().from(documents).where(eq(documents.tenantId, user.tenant_id)).orderBy(desc(documents.createdAt));
  let filtered = results;
  if (filters?.type) filtered = filtered.filter(d => d.type === filters.type);
  if (filters?.module) filtered = filtered.filter(d => d.module === filters.module);
  if (filters?.status) filtered = filtered.filter(d => d.status === filters.status);
  return filtered;
}

export async function createDocument(data: unknown) {
  const user = await getCurrentUser();
  const parsed = createDocumentSchema.parse(data);
  const { expiresAt, ...rest } = parsed;
  const [created] = await db.insert(documents).values({
    tenantId: user.tenant_id,
    createdBy: user.id,
    ...rest,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  }).returning();
  await logAction({
    action: 'document.created',
    entity_type: 'document',
    entity_id: created.id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { title: parsed.title, type: parsed.type },
  });
  return created;
}

export async function updateDocumentStatus(id: string, status: 'draft' | 'pending_approval' | 'approved' | 'expired') {
  const user = await getCurrentUser();
  const values: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === 'approved') {
    values.approvedBy = user.id;
    values.approvedAt = new Date();
  }
  const [updated] = await db.update(documents)
    .set(values)
    .where(and(eq(documents.id, id), eq(documents.tenantId, user.tenant_id)))
    .returning();
  if (!updated) throw new Error('Document not found');
  await logAction({
    action: 'document.status_updated',
    entity_type: 'document',
    entity_id: id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { status },
  });
  return updated;
}

export async function uploadDocumentFile(documentId: string, formData: FormData) {
  const user = await getCurrentUser();

  // Verify document belongs to tenant
  const [doc] = await db.select().from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.tenantId, user.tenant_id)))
    .limit(1);
  if (!doc) throw new Error('Document not found');

  const file = formData.get('file') as File | null;
  if (!file) throw new Error('No file provided');

  const supabase = await createSupabaseServer();
  const filePath = `${user.tenant_id}/${documentId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  const [updated] = await db.update(documents)
    .set({ filePath: publicUrl, updatedAt: new Date() })
    .where(and(eq(documents.id, documentId), eq(documents.tenantId, user.tenant_id)))
    .returning();

  await logAction({
    action: 'document.file_uploaded',
    entity_type: 'document',
    entity_id: documentId,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { fileName: file.name, filePath: publicUrl },
  });

  return { url: publicUrl, document: updated };
}
