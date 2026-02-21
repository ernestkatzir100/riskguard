'use server';

import { db } from '@/db';
import { risks, tasks } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import * as XLSX from 'xlsx';

type ImportResult = { inserted: number; errors: string[] };

/**
 * Import risks from Excel/CSV file (base64-encoded).
 * Expected columns: title, category, probability, impact, status, description
 */
export async function importRisks(base64: string, filename: string): Promise<ImportResult> {
  const user = await getCurrentUserOrDemo();
  const buf = Buffer.from(base64, 'base64');
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const errors: string[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = String(row['title'] || row['שם'] || row['כותרת'] || '').trim();
    if (!title) { errors.push(`שורה ${i + 2}: חסר שם סיכון`); continue; }

    const category = String(row['category'] || row['קטגוריה'] || 'operational');
    const probability = Math.min(5, Math.max(1, Number(row['probability'] || row['סבירות'] || 3)));
    const impact = Math.min(5, Math.max(1, Number(row['impact'] || row['השפעה'] || 3)));
    const status = String(row['status'] || row['סטטוס'] || 'open');
    const description = String(row['description'] || row['תיאור'] || '');

    try {
      await db.insert(risks).values({
        tenantId: user.tenant_id,
        title,
        category: (['operational', 'fraud', 'outsourcing', 'cyber', 'bcp', 'credit', 'governance'].includes(category) ? category : 'operational') as 'operational',
        probability,
        impact,
        riskScore: probability * impact,
        status: (['open', 'mitigated', 'accepted', 'closed'].includes(status) ? status : 'open') as 'open',
        description,
      });
      inserted++;
    } catch (err) {
      errors.push(`שורה ${i + 2}: ${err instanceof Error ? err.message : 'שגיאה'}`);
    }
  }

  await logAction({
    action: 'risk.imported',
    entity_type: 'risk',
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { filename, inserted, errors: errors.length },
  });

  return { inserted, errors };
}

/**
 * Import tasks from Excel/CSV file (base64-encoded).
 * Expected columns: title, priority, dueDate, status, description, module
 */
export async function importTasks(base64: string, filename: string): Promise<ImportResult> {
  const user = await getCurrentUserOrDemo();
  const buf = Buffer.from(base64, 'base64');
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const errors: string[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = String(row['title'] || row['כותרת'] || row['שם'] || '').trim();
    if (!title) { errors.push(`שורה ${i + 2}: חסר שם משימה`); continue; }

    const priority = String(row['priority'] || row['עדיפות'] || 'medium');
    const status = String(row['status'] || row['סטטוס'] || 'pending');
    const description = String(row['description'] || row['תיאור'] || '');
    const rawDate = row['dueDate'] || row['תאריך_יעד'] || row['תאריך יעד'];
    let dueDate: string | null = null;
    if (rawDate) {
      const d = new Date(String(rawDate));
      if (!isNaN(d.getTime())) dueDate = d.toISOString().split('T')[0];
    }

    try {
      await db.insert(tasks).values({
        tenantId: user.tenant_id,
        title,
        description,
        priority: (['high', 'medium', 'low'].includes(priority) ? priority : 'medium') as 'medium',
        status: (['pending', 'in_progress', 'completed', 'overdue'].includes(status) ? status : 'pending') as 'pending',
        dueDate,
      });
      inserted++;
    } catch (err) {
      errors.push(`שורה ${i + 2}: ${err instanceof Error ? err.message : 'שגיאה'}`);
    }
  }

  await logAction({
    action: 'task.imported',
    entity_type: 'task',
    user_id: user.id,
    tenant_id: user.tenant_id,
    details: { filename, inserted, errors: errors.length },
  });

  return { inserted, errors };
}
