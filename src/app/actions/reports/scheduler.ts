'use server';

// Report scheduler placeholder
// In production, this would be triggered by a Supabase Edge Function or cron job

import { db } from '@/db';
import { tasks } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function checkScheduledReports() {
  // Check for overdue tasks that need attention
  const overdue = await db.select({
    tenantId: tasks.tenantId,
    count: sql<number>`count(*)::int`,
  }).from(tasks).where(sql`${tasks.status} != 'completed' AND ${tasks.dueDate} < CURRENT_DATE`).groupBy(tasks.tenantId);

  return overdue;
}
