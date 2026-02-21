import { NextResponse } from 'next/server';
import { db } from '@/db';
import { kris, tasks, users, notifications, tenants } from '@/db/schema';
import { eq, and, ne, sql } from 'drizzle-orm';
import { sendEmail } from '@/app/actions/email';
import { kriBreachEmail, taskOverdueEmail } from '@/shared/lib/email-templates';

/**
 * GET /api/cron/notify
 * Scans all tenants for KRI breaches and overdue tasks,
 * creates notifications and sends email alerts.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let kriCount = 0;
  let taskCount = 0;

  try {
    const allTenants = await db.select({ id: tenants.id }).from(tenants);

    for (const tenant of allTenants) {
      // Get admin users for this tenant (notification recipients)
      const admins = await db.select().from(users)
        .where(and(eq(users.tenantId, tenant.id), eq(users.role, 'admin')));
      if (admins.length === 0) continue;

      // --- KRI Breach Alerts ---
      const breachedKRIs = await db.select().from(kris)
        .where(and(eq(kris.tenantId, tenant.id), eq(kris.breached, true)));

      for (const kri of breachedKRIs) {
        // Check if notification already sent (dedup)
        const [existing] = await db.select({ id: notifications.id }).from(notifications)
          .where(and(
            eq(notifications.tenantId, tenant.id),
            eq(notifications.entityType, 'kri'),
            eq(notifications.entityId, kri.id),
            eq(notifications.type, 'kri_breach'),
            eq(notifications.emailSent, true),
          )).limit(1);
        if (existing) continue;

        for (const admin of admins) {
          const email = kriBreachEmail(kri.name, kri.currentValue || '');
          const [notif] = await db.insert(notifications).values({
            tenantId: tenant.id,
            userId: admin.id,
            type: 'kri_breach',
            title: email.subject,
            body: `מדד ${kri.name} חרג מסף (ערך: ${kri.currentValue}, סף: ${kri.threshold})`,
            entityType: 'kri',
            entityId: kri.id,
          }).returning();

          await sendEmail(admin.email, email.subject, email.html);
          await db.update(notifications).set({ emailSent: true }).where(eq(notifications.id, notif.id));
          kriCount++;
        }
      }

      // --- Overdue Task Alerts ---
      const overdue = await db.select().from(tasks)
        .where(and(
          eq(tasks.tenantId, tenant.id),
          ne(tasks.status, 'completed'),
          sql`${tasks.dueDate} < CURRENT_DATE`,
        ));

      for (const task of overdue) {
        const [existing] = await db.select({ id: notifications.id }).from(notifications)
          .where(and(
            eq(notifications.tenantId, tenant.id),
            eq(notifications.entityType, 'task'),
            eq(notifications.entityId, task.id),
            eq(notifications.type, 'task_overdue'),
            eq(notifications.emailSent, true),
          )).limit(1);
        if (existing) continue;

        // Send to assigned user if exists, otherwise to admins
        const recipients = task.assignedTo
          ? await db.select().from(users).where(eq(users.id, task.assignedTo)).limit(1)
          : admins;

        for (const recipient of recipients) {
          const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('he-IL') : '';
          const email = taskOverdueEmail(task.title, dueDateStr);
          const [notif] = await db.insert(notifications).values({
            tenantId: tenant.id,
            userId: recipient.id,
            type: 'task_overdue',
            title: email.subject,
            body: `משימה "${task.title}" עברה את תאריך היעד (${dueDateStr})`,
            entityType: 'task',
            entityId: task.id,
          }).returning();

          await sendEmail(recipient.email, email.subject, email.html);
          await db.update(notifications).set({ emailSent: true }).where(eq(notifications.id, notif.id));
          taskCount++;
        }
      }
    }
  } catch (error) {
    console.error('Notification cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    kriAlerts: kriCount,
    taskAlerts: taskCount,
    timestamp: new Date().toISOString(),
  });
}
