import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createNotification(params: {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
}) {
  const [notif] = await db.insert(notifications).values(params).returning();
  return notif;
}

export async function markAsRead(notificationId: string) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const result = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return result.length;
}

export async function getNotifications(userId: string, limit = 20) {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}
