'use server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createTaskSchema } from '@/shared/lib/validators';
import { eq, and, desc, ne, sql } from 'drizzle-orm';

export async function getTasks(filters?: { module?: string; status?: string; assignedTo?: string }) {
  const user = await getCurrentUserOrDemo();
  const results = await db.select().from(tasks).where(eq(tasks.tenantId, user.tenant_id)).orderBy(desc(tasks.createdAt));
  let filtered = results;
  if (filters?.module) filtered = filtered.filter(t => t.module === filters.module);
  if (filters?.status) filtered = filtered.filter(t => t.status === filters.status);
  if (filters?.assignedTo) filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
  return filtered;
}

export async function createTask(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createTaskSchema.parse(data);
  const [created] = await db.insert(tasks).values({
    tenantId: user.tenant_id,
    ...parsed,
  }).returning();
  await logAction({
    action: 'task.created',
    entity_type: 'task',
    entity_id: created.id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { title: parsed.title },
  });
  return created;
}

export async function updateTaskStatus(id: string, status: 'pending' | 'in_progress' | 'completed' | 'overdue') {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(tasks)
    .set({ status })
    .where(and(eq(tasks.id, id), eq(tasks.tenantId, user.tenant_id)))
    .returning();
  if (!updated) throw new Error('Task not found');
  await logAction({
    action: 'task.status_updated',
    entity_type: 'task',
    entity_id: id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { status },
  });
  return updated;
}

export async function completeTask(id: string) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(tasks)
    .set({ status: 'completed', completedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.tenantId, user.tenant_id)))
    .returning();
  if (!updated) throw new Error('Task not found');
  await logAction({
    action: 'task.completed',
    entity_type: 'task',
    entity_id: id,
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { completedAt: new Date().toISOString() },
  });
  return updated;
}

export async function getOverdueTasks() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(tasks)
    .where(and(
      eq(tasks.tenantId, user.tenant_id),
      ne(tasks.status, 'completed'),
      sql`${tasks.dueDate} < CURRENT_DATE`,
    ))
    .orderBy(tasks.dueDate);
}

export async function getTasksByModule(module: string) {
  const user = await getCurrentUserOrDemo();
  const results = await db.select().from(tasks)
    .where(eq(tasks.tenantId, user.tenant_id))
    .orderBy(desc(tasks.createdAt));
  return results.filter(t => t.module === module);
}
