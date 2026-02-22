'use server';

import { db } from '@/db';
import {
  tenants, nutelaPushes, complianceStatus, regRequirements,
} from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export type NutelaTenantSummary = {
  id: string;
  name: string;
  pendingCount: number;
  answeredCount: number;
  overdueCount: number;
};

export async function getNutelaData() {
  const allTenants = await db.select({ id: tenants.id, name: tenants.name }).from(tenants);

  // Get push counts per tenant grouped by status
  const pushCounts = await db
    .select({
      tenantId: nutelaPushes.tenantId,
      status: nutelaPushes.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(nutelaPushes)
    .groupBy(nutelaPushes.tenantId, nutelaPushes.status);

  const countMap = new Map<string, Record<string, number>>();
  for (const pc of pushCounts) {
    const existing = countMap.get(pc.tenantId) ?? {};
    existing[pc.status] = pc.count;
    countMap.set(pc.tenantId, existing);
  }

  const summaries: NutelaTenantSummary[] = allTenants.map(t => {
    const counts = countMap.get(t.id) ?? {};
    return {
      id: t.id,
      name: t.name,
      pendingCount: (counts.pending ?? 0) + (counts.sent ?? 0),
      answeredCount: counts.answered ?? 0,
      overdueCount: counts.overdue ?? 0,
    };
  });

  return summaries;
}

export async function getTenantPushes(tenantId: string) {
  return db
    .select()
    .from(nutelaPushes)
    .where(eq(nutelaPushes.tenantId, tenantId))
    .orderBy(desc(nutelaPushes.createdAt));
}

export async function createPush(data: {
  tenantId: string;
  type: 'task' | 'questionnaire';
  title: string;
  description: string;
  schedule: string | null;
  generatedBy: 'manual' | 'nutela_ai';
}) {
  const [push] = await db.insert(nutelaPushes).values({
    tenantId: data.tenantId,
    type: data.type,
    title: data.title,
    description: data.description,
    status: 'sent',
    schedule: data.schedule,
    generatedBy: data.generatedBy,
  }).returning();
  return push;
}

export async function getTenantComplianceGaps(tenantId: string) {
  // Get requirements that are non_compliant or not_started for this tenant
  const gaps = await db
    .select({
      reqId: regRequirements.id,
      requirementHe: regRequirements.requirementHe,
      module: regRequirements.module,
      reqCode: regRequirements.reqCode,
      status: complianceStatus.status,
    })
    .from(complianceStatus)
    .innerJoin(regRequirements, eq(complianceStatus.requirementId, regRequirements.id))
    .where(
      and(
        eq(complianceStatus.tenantId, tenantId),
        sql`${complianceStatus.status} IN ('non_compliant', 'not_started')`,
      )
    )
    .limit(20);

  return gaps;
}

export async function generateAITasks(tenantId: string, gaps: { requirementHe: string; module: string; reqCode: string | null }[]) {
  // Call Anthropic API to generate tasks based on compliance gaps
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback: generate simple tasks without AI
    return gaps.slice(0, 5).map(g => ({
      title: `טיפול בדרישה: ${g.reqCode ?? g.module}`,
      description: `יש לטפל בדרישה: ${g.requirementHe}`,
      module: g.module,
    }));
  }

  const gapList = gaps.slice(0, 10).map((g, i) =>
    `${i + 1}. [${g.reqCode ?? g.module}] ${g.requirementHe}`
  ).join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `אתה יועץ ציות רגולטורי ישראלי. הנה פערי ציות של חברה:\n\n${gapList}\n\nצור 3-5 משימות קונקרטיות בעברית לסגירת הפערים. לכל משימה:\n- title: כותרת קצרה (עד 60 תווים)\n- description: תיאור מפורט\n- module: שם המודול\n\nהחזר JSON array בלבד, ללא טקסט נוסף. פורמט:\n[{"title":"...","description":"...","module":"..."}]`,
      }],
    }),
  });

  if (!response.ok) {
    throw new Error('שגיאה בחיבור ל-AI');
  }

  const result = await response.json();
  const text = result.content?.[0]?.text ?? '[]';

  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as { title: string; description: string; module: string }[];
  } catch {
    return [];
  }
}
