'use server';
import { db } from '@/db';
import { directors, boardMeetings, boardDecisions, protocolApprovals } from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { createBoardMeetingSchema, createBoardDecisionSchema } from '@/shared/lib/validators';
import { eq, and, desc } from 'drizzle-orm';

export async function getDirectors() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(directors).where(and(eq(directors.tenantId, user.tenant_id), eq(directors.active, true)));
}

export async function getBoardMeetings() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(boardMeetings).where(eq(boardMeetings.tenantId, user.tenant_id)).orderBy(desc(boardMeetings.date));
}

export async function getBoardDecisions(meetingId?: string) {
  const user = await getCurrentUserOrDemo();
  if (meetingId) {
    return db.select().from(boardDecisions).where(and(eq(boardDecisions.tenantId, user.tenant_id), eq(boardDecisions.meetingId, meetingId))).orderBy(desc(boardDecisions.createdAt));
  }
  return db.select().from(boardDecisions).where(eq(boardDecisions.tenantId, user.tenant_id)).orderBy(desc(boardDecisions.createdAt));
}

export async function createBoardMeeting(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createBoardMeetingSchema.parse(data);
  const [created] = await db.insert(boardMeetings).values({ tenantId: user.tenant_id, ...parsed }).returning();
  await logAction({ action: 'board_meeting.created', entity_type: 'board_meeting', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { meetingType: parsed.meetingType, date: parsed.date } });
  return created;
}

export async function createBoardDecision(data: unknown) {
  const user = await getCurrentUserOrDemo();
  const parsed = createBoardDecisionSchema.parse(data);
  const [created] = await db.insert(boardDecisions).values({ tenantId: user.tenant_id, ...parsed }).returning();
  await logAction({ action: 'board_decision.created', entity_type: 'board_decision', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { text: parsed.text } });
  return created;
}

export async function updateDecisionStatus(id: string, status: string) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(boardDecisions).set({ status }).where(and(eq(boardDecisions.id, id), eq(boardDecisions.tenantId, user.tenant_id))).returning();
  if (!updated) throw new Error('Decision not found');
  await logAction({ action: 'board_decision.updated', entity_type: 'board_decision', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: { status } });
  return updated;
}

export async function getProtocolApprovals(meetingId: string) {
  const user = await getCurrentUserOrDemo();
  return db.select().from(protocolApprovals).where(and(eq(protocolApprovals.meetingId, meetingId), eq(protocolApprovals.tenantId, user.tenant_id)));
}
