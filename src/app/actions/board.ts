'use server';

import { db } from '@/db';
import {
  directors, boardCommittees, boardCommitteeMembers, boardTopics,
  boardRecurringSeries, boardMeetings, boardDecisions, boardAgendaItems,
  boardActionItems, boardDocuments, boardApprovals, boardAttendance,
  boardReports, tasks,
} from '@/db/schema';
import { getCurrentUserOrDemo } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';

// ═══════════════════════════════════════════════
// DIRECTORS
// ═══════════════════════════════════════════════

export async function getDirectors() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(directors).where(and(eq(directors.tenantId, user.tenant_id), eq(directors.active, true)));
}

export async function createDirector(data: { fullName: string; email?: string; phone?: string; role?: string; appointmentDate?: string }) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(directors).values({ tenantId: user.tenant_id, ...data }).returning();
  await logAction({ action: 'director.created', entity_type: 'director', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { fullName: data.fullName } });
  return created;
}

export async function updateDirector(id: string, data: Partial<{ fullName: string; email: string; phone: string; role: string; appointmentDate: string; active: boolean }>) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(directors).set(data).where(and(eq(directors.id, id), eq(directors.tenantId, user.tenant_id))).returning();
  await logAction({ action: 'director.updated', entity_type: 'director', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: data as Record<string, unknown> });
  return updated;
}

export async function deleteDirector(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.update(directors).set({ active: false }).where(and(eq(directors.id, id), eq(directors.tenantId, user.tenant_id)));
  await logAction({ action: 'director.deleted', entity_type: 'director', entity_id: id, user_id: user.id, tenant_id: user.tenant_id });
}

// ═══════════════════════════════════════════════
// COMMITTEES
// ═══════════════════════════════════════════════

export async function getCommittees() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(boardCommittees).where(and(eq(boardCommittees.tenantId, user.tenant_id), eq(boardCommittees.isActive, true)));
}

export async function createCommittee(data: { name: string; type: string; quorumMinimum?: number; meetingFrequency?: string }) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardCommittees).values({ tenantId: user.tenant_id, ...data }).returning();
  await logAction({ action: 'committee.created', entity_type: 'board_committee', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { name: data.name } });
  return created;
}

export async function updateCommittee(id: string, data: Partial<{ name: string; type: string; quorumMinimum: number; meetingFrequency: string; isActive: boolean }>) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(boardCommittees).set(data).where(and(eq(boardCommittees.id, id), eq(boardCommittees.tenantId, user.tenant_id))).returning();
  await logAction({ action: 'committee.updated', entity_type: 'board_committee', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: data as Record<string, unknown> });
  return updated;
}

export async function deleteCommittee(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.update(boardCommittees).set({ isActive: false }).where(and(eq(boardCommittees.id, id), eq(boardCommittees.tenantId, user.tenant_id)));
  await logAction({ action: 'committee.deleted', entity_type: 'board_committee', entity_id: id, user_id: user.id, tenant_id: user.tenant_id });
}

export async function getCommitteeMembers(committeeId: string) {
  const user = await getCurrentUserOrDemo();
  const members = await db.select({ member: boardCommitteeMembers, director: directors })
    .from(boardCommitteeMembers)
    .innerJoin(directors, eq(boardCommitteeMembers.directorId, directors.id))
    .where(and(eq(boardCommitteeMembers.committeeId, committeeId), eq(boardCommitteeMembers.tenantId, user.tenant_id)));
  return members.map(m => m.director);
}

export async function addCommitteeMember(committeeId: string, directorId: string) {
  const user = await getCurrentUserOrDemo();
  await db.insert(boardCommitteeMembers).values({ committeeId, directorId, tenantId: user.tenant_id }).onConflictDoNothing();
}

export async function removeCommitteeMember(committeeId: string, directorId: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(boardCommitteeMembers).where(
    and(eq(boardCommitteeMembers.committeeId, committeeId), eq(boardCommitteeMembers.directorId, directorId), eq(boardCommitteeMembers.tenantId, user.tenant_id))
  );
}

// ═══════════════════════════════════════════════
// TOPICS
// ═══════════════════════════════════════════════

export async function getTopics(committeeId?: string) {
  const user = await getCurrentUserOrDemo();
  const base = eq(boardTopics.tenantId, user.tenant_id);
  const conditions = committeeId
    ? and(base, eq(boardTopics.committeeId, committeeId), eq(boardTopics.isActive, true))
    : and(base, eq(boardTopics.isActive, true));
  return db.select().from(boardTopics).where(conditions).orderBy(boardTopics.group, boardTopics.title);
}

export async function createTopic(data: { title: string; group: 'business' | 'regulatory' | 'risk'; interval: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'ad_hoc'; committeeId?: string; regulationRef?: string }) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardTopics).values({ tenantId: user.tenant_id, ...data }).returning();
  await logAction({ action: 'topic.created', entity_type: 'board_topic', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { title: data.title } });
  return created;
}

export async function updateTopic(id: string, data: Partial<{ title: string; group: 'business' | 'regulatory' | 'risk'; interval: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'ad_hoc'; committeeId: string; regulationRef: string; isActive: boolean }>) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(boardTopics).set(data).where(and(eq(boardTopics.id, id), eq(boardTopics.tenantId, user.tenant_id))).returning();
  await logAction({ action: 'topic.updated', entity_type: 'board_topic', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: data as Record<string, unknown> });
  return updated;
}

export async function deactivateTopic(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.update(boardTopics).set({ isActive: false }).where(and(eq(boardTopics.id, id), eq(boardTopics.tenantId, user.tenant_id)));
  await logAction({ action: 'topic.deactivated', entity_type: 'board_topic', entity_id: id, user_id: user.id, tenant_id: user.tenant_id });
}

// ═══════════════════════════════════════════════
// RECURRING SERIES
// ═══════════════════════════════════════════════

export async function getRecurringSeries() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(boardRecurringSeries).where(and(eq(boardRecurringSeries.tenantId, user.tenant_id), eq(boardRecurringSeries.isActive, true)));
}

export async function createRecurringSeries(data: { committeeId: string; frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'; nextDate?: string }) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardRecurringSeries).values({ tenantId: user.tenant_id, ...data }).returning();
  return created;
}

// ═══════════════════════════════════════════════
// MEETINGS
// ═══════════════════════════════════════════════

export async function getBoardMeetings() {
  const user = await getCurrentUserOrDemo();
  return db.select().from(boardMeetings).where(eq(boardMeetings.tenantId, user.tenant_id)).orderBy(desc(boardMeetings.date));
}

export async function getBoardMeeting(id: string) {
  const user = await getCurrentUserOrDemo();
  const [meeting] = await db.select().from(boardMeetings).where(and(eq(boardMeetings.id, id), eq(boardMeetings.tenantId, user.tenant_id)));
  return meeting || null;
}

export async function createBoardMeeting(data: {
  meetingType: string; date: string; quarter?: string; committeeId?: string;
  time?: string; location?: string; locationType?: string;
  agenda?: string[]; attendees?: string[]; recurringSeriesId?: string;
}) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardMeetings).values({
    tenantId: user.tenant_id,
    meetingType: data.meetingType,
    date: data.date,
    quarter: data.quarter,
    committeeId: data.committeeId,
    time: data.time,
    location: data.location,
    locationType: data.locationType,
    agenda: data.agenda || [],
    attendees: data.attendees || [],
    recurringSeriesId: data.recurringSeriesId,
    stage: 'draft',
    status: 'scheduled',
  }).returning();
  await logAction({ action: 'board_meeting.created', entity_type: 'board_meeting', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { meetingType: data.meetingType, date: data.date } });
  return created;
}

export async function updateBoardMeeting(id: string, data: Record<string, unknown>) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(boardMeetings).set(data as Record<string, unknown>).where(and(eq(boardMeetings.id, id), eq(boardMeetings.tenantId, user.tenant_id))).returning();
  if (!updated) throw new Error('Meeting not found');
  await logAction({ action: 'board_meeting.updated', entity_type: 'board_meeting', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: data });
  return updated;
}

export async function deleteBoardMeeting(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(boardAgendaItems).where(eq(boardAgendaItems.meetingId, id));
  await db.delete(boardActionItems).where(eq(boardActionItems.meetingId, id));
  await db.delete(boardAttendance).where(eq(boardAttendance.meetingId, id));
  await db.delete(boardApprovals).where(eq(boardApprovals.meetingId, id));
  await db.delete(boardDocuments).where(eq(boardDocuments.meetingId, id));
  await db.delete(boardDecisions).where(eq(boardDecisions.meetingId, id));
  await db.delete(boardMeetings).where(and(eq(boardMeetings.id, id), eq(boardMeetings.tenantId, user.tenant_id)));
  await logAction({ action: 'board_meeting.deleted', entity_type: 'board_meeting', entity_id: id, user_id: user.id, tenant_id: user.tenant_id });
}

export async function updateMeetingStage(id: string, stage: 'draft' | 'scheduled' | 'in_progress' | 'pending_approval' | 'approved') {
  const user = await getCurrentUserOrDemo();
  const statusMap: Record<string, string> = { draft: 'scheduled', scheduled: 'scheduled', in_progress: 'scheduled', pending_approval: 'scheduled', approved: 'completed' };
  const [updated] = await db.update(boardMeetings).set({ stage, status: (statusMap[stage] || 'scheduled') as 'scheduled' | 'completed' | 'cancelled' }).where(and(eq(boardMeetings.id, id), eq(boardMeetings.tenantId, user.tenant_id))).returning();
  await logAction({ action: 'board_meeting.stage_changed', entity_type: 'board_meeting', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: { stage } });
  return updated;
}

// ═══════════════════════════════════════════════
// AGENDA ITEMS
// ═══════════════════════════════════════════════

export async function getAgendaItems(meetingId: string) {
  const user = await getCurrentUserOrDemo();
  return db.select().from(boardAgendaItems).where(and(eq(boardAgendaItems.meetingId, meetingId), eq(boardAgendaItems.tenantId, user.tenant_id))).orderBy(asc(boardAgendaItems.orderIndex));
}

export async function createAgendaItem(data: {
  meetingId: string; title: string; topicId?: string; orderIndex?: number;
  presenter?: string; estimatedMinutes?: number; group?: 'business' | 'regulatory' | 'risk';
}) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardAgendaItems).values({ tenantId: user.tenant_id, ...data }).returning();
  await logAction({ action: 'agenda_item.created', entity_type: 'board_agenda_item', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { title: data.title } });
  return created;
}

export async function updateAgendaItem(id: string, data: Partial<{
  title: string; orderIndex: number; presenter: string; estimatedMinutes: number;
  status: 'pending' | 'discussed' | 'postponed' | 'cancelled'; discussionNotes: string; group: 'business' | 'regulatory' | 'risk';
}>) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(boardAgendaItems).set(data).where(and(eq(boardAgendaItems.id, id), eq(boardAgendaItems.tenantId, user.tenant_id))).returning();
  return updated;
}

export async function deleteAgendaItem(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(boardAgendaItems).where(and(eq(boardAgendaItems.id, id), eq(boardAgendaItems.tenantId, user.tenant_id)));
}

// ═══════════════════════════════════════════════
// ACTION ITEMS
// ═══════════════════════════════════════════════

export async function getActionItems(filters?: { meetingId?: string; status?: string; committeeId?: string }) {
  const user = await getCurrentUserOrDemo();
  let items = await db.select().from(boardActionItems).where(eq(boardActionItems.tenantId, user.tenant_id)).orderBy(desc(boardActionItems.createdAt));
  if (filters?.meetingId) items = items.filter(i => i.meetingId === filters.meetingId);
  if (filters?.status) items = items.filter(i => i.status === filters.status);
  return items;
}

export async function createActionItem(data: {
  title: string; meetingId?: string; agendaItemId?: string; ownerId?: string; ownerName?: string;
  dueDate?: string; priority?: 'high' | 'medium' | 'low'; linkedRegulationRef?: string;
}) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardActionItems).values({ tenantId: user.tenant_id, ...data }).returning();
  await logAction({ action: 'action_item.created', entity_type: 'board_action_item', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { title: data.title } });
  return created;
}

export async function updateActionItem(id: string, data: Partial<{
  title: string; ownerId: string; ownerName: string; dueDate: string;
  priority: 'high' | 'medium' | 'low'; status: 'open' | 'in_progress' | 'done' | 'overdue';
  linkedRegulationRef: string; syncedToTasks: boolean; taskId: string;
}>) {
  const user = await getCurrentUserOrDemo();
  const [updated] = await db.update(boardActionItems).set(data).where(and(eq(boardActionItems.id, id), eq(boardActionItems.tenantId, user.tenant_id))).returning();
  await logAction({ action: 'action_item.updated', entity_type: 'board_action_item', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: data as Record<string, unknown> });
  return updated;
}

export async function syncActionItemToTask(id: string) {
  const user = await getCurrentUserOrDemo();
  const [item] = await db.select().from(boardActionItems).where(and(eq(boardActionItems.id, id), eq(boardActionItems.tenantId, user.tenant_id)));
  if (!item) throw new Error('Action item not found');
  const [task] = await db.insert(tasks).values({
    tenantId: user.tenant_id,
    title: item.title,
    module: 'board',
    assignedTo: item.ownerName || undefined,
    dueDate: item.dueDate || undefined,
    priority: item.priority === 'high' ? 'high' : item.priority === 'low' ? 'low' : 'medium',
    status: item.status === 'done' ? 'completed' : item.status === 'in_progress' ? 'in_progress' : 'pending',
  }).returning();
  await db.update(boardActionItems).set({ syncedToTasks: true, taskId: task.id }).where(eq(boardActionItems.id, id));
  await logAction({ action: 'action_item.synced_to_tasks', entity_type: 'board_action_item', entity_id: id, user_id: user.id, tenant_id: user.tenant_id, details: { taskId: task.id } });
  return task;
}

// ═══════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════

export async function getAttendance(meetingId: string) {
  const user = await getCurrentUserOrDemo();
  return db.select().from(boardAttendance).where(and(eq(boardAttendance.meetingId, meetingId), eq(boardAttendance.tenantId, user.tenant_id)));
}

export async function upsertAttendance(meetingId: string, directorId: string, attended: boolean) {
  const user = await getCurrentUserOrDemo();
  const existing = await db.select().from(boardAttendance).where(and(eq(boardAttendance.meetingId, meetingId), eq(boardAttendance.directorId, directorId)));
  if (existing.length > 0) {
    await db.update(boardAttendance).set({ attended }).where(and(eq(boardAttendance.meetingId, meetingId), eq(boardAttendance.directorId, directorId)));
  } else {
    await db.insert(boardAttendance).values({ meetingId, directorId, tenantId: user.tenant_id, attended });
  }
}

// ═══════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════

export async function getApprovals(meetingId: string) {
  const user = await getCurrentUserOrDemo();
  const approvals = await db.select({ approval: boardApprovals, director: directors })
    .from(boardApprovals)
    .innerJoin(directors, eq(boardApprovals.directorId, directors.id))
    .where(and(eq(boardApprovals.meetingId, meetingId), eq(boardApprovals.tenantId, user.tenant_id)));
  return approvals.map(a => ({ ...a.approval, directorName: a.director.fullName, directorEmail: a.director.email }));
}

export async function createApprovals(meetingId: string, directorIds: string[]) {
  const user = await getCurrentUserOrDemo();
  for (const directorId of directorIds) {
    await db.insert(boardApprovals).values({ meetingId, directorId, tenantId: user.tenant_id }).onConflictDoNothing();
  }
  await logAction({ action: 'approvals.created', entity_type: 'board_approval', entity_id: meetingId, user_id: user.id, tenant_id: user.tenant_id, details: { directorCount: directorIds.length } });
}

export async function respondToApproval(token: string, status: 'approved' | 'rejected', comment?: string) {
  const [approval] = await db.select().from(boardApprovals).where(eq(boardApprovals.token, token));
  if (!approval) throw new Error('Approval not found');
  await db.update(boardApprovals).set({ status, comment, respondedAt: new Date() }).where(eq(boardApprovals.token, token));
  await logAction({ action: `approval.${status}`, entity_type: 'board_approval', entity_id: approval.id, user_id: approval.directorId, tenant_id: approval.tenantId, details: { meetingId: approval.meetingId, comment } });
  return approval;
}

// ═══════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════

export async function getDocuments(meetingId?: string) {
  const user = await getCurrentUserOrDemo();
  if (meetingId) {
    return db.select().from(boardDocuments).where(and(eq(boardDocuments.meetingId, meetingId), eq(boardDocuments.tenantId, user.tenant_id))).orderBy(desc(boardDocuments.uploadedAt));
  }
  return db.select().from(boardDocuments).where(eq(boardDocuments.tenantId, user.tenant_id)).orderBy(desc(boardDocuments.uploadedAt));
}

export async function uploadDocument(data: { meetingId?: string; agendaItemId?: string; filename: string; fileType?: string; fileData: string }) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardDocuments).values({ tenantId: user.tenant_id, uploadedBy: user.id, ...data }).returning();
  await logAction({ action: 'document.uploaded', entity_type: 'board_document', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { filename: data.filename } });
  return created;
}

export async function deleteDocument(id: string) {
  const user = await getCurrentUserOrDemo();
  await db.delete(boardDocuments).where(and(eq(boardDocuments.id, id), eq(boardDocuments.tenantId, user.tenant_id)));
}

// ═══════════════════════════════════════════════
// DECISIONS (legacy compat)
// ═══════════════════════════════════════════════

export async function getBoardDecisions(meetingId?: string) {
  const user = await getCurrentUserOrDemo();
  if (meetingId) {
    return db.select().from(boardDecisions).where(and(eq(boardDecisions.tenantId, user.tenant_id), eq(boardDecisions.meetingId, meetingId))).orderBy(desc(boardDecisions.createdAt));
  }
  return db.select().from(boardDecisions).where(eq(boardDecisions.tenantId, user.tenant_id)).orderBy(desc(boardDecisions.createdAt));
}

export async function createBoardDecision(data: { meetingId: string; text: string; ownerName?: string; ownerId?: string; dueDate?: string }) {
  const user = await getCurrentUserOrDemo();
  const [created] = await db.insert(boardDecisions).values({ tenantId: user.tenant_id, ...data }).returning();
  await logAction({ action: 'board_decision.created', entity_type: 'board_decision', entity_id: created.id, user_id: user.id, tenant_id: user.tenant_id, details: { text: data.text } });
  return created;
}

// ═══════════════════════════════════════════════
// DASHBOARD AGGREGATION
// ═══════════════════════════════════════════════

export async function getBoardDashboardData() {
  const user = await getCurrentUserOrDemo();
  const tid = user.tenant_id;

  const [allMeetings, allActions, allTopics, allCommittees, allAttendanceRaw, allDirectorsList] = await Promise.all([
    db.select().from(boardMeetings).where(eq(boardMeetings.tenantId, tid)).orderBy(desc(boardMeetings.date)),
    db.select().from(boardActionItems).where(eq(boardActionItems.tenantId, tid)),
    db.select().from(boardTopics).where(and(eq(boardTopics.tenantId, tid), eq(boardTopics.isActive, true))),
    db.select().from(boardCommittees).where(and(eq(boardCommittees.tenantId, tid), eq(boardCommittees.isActive, true))),
    db.select().from(boardAttendance).where(eq(boardAttendance.tenantId, tid)),
    db.select().from(directors).where(and(eq(directors.tenantId, tid), eq(directors.active, true))),
  ]);

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const meetingsThisYear = allMeetings.filter(m => m.date >= yearStart);
  const nextMeeting = allMeetings.filter(m => m.date >= now.toISOString().split('T')[0]).sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  const openActions = allActions.filter(a => a.status === 'open' || a.status === 'in_progress');
  const overdueActions = allActions.filter(a => (a.status === 'open' || a.status === 'in_progress') && a.dueDate && a.dueDate < now.toISOString().split('T')[0]);

  const regulatoryTopics = allTopics.filter(t => t.regulationRef);
  const approvedMeetings = meetingsThisYear.filter(m => m.stage === 'approved');

  return {
    nextMeeting,
    meetingsThisYear: meetingsThisYear.length,
    approvedMeetings: approvedMeetings.length,
    openActionItems: openActions.length,
    overdueActionItems: overdueActions.length,
    totalTopics: allTopics.length,
    regulatoryTopics: regulatoryTopics.length,
    committees: allCommittees,
    allMeetings,
    allActions,
    allDirectors: allDirectorsList,
    allAttendance: allAttendanceRaw,
  };
}

// ═══════════════════════════════════════════════
// SEED DEFAULT DATA
// ═══════════════════════════════════════════════

export async function seedBoardDefaults() {
  const user = await getCurrentUserOrDemo();
  const tid = user.tenant_id;

  // Check if already seeded
  const existing = await db.select().from(boardCommittees).where(eq(boardCommittees.tenantId, tid));
  if (existing.length > 0) return { seeded: false, message: 'Already seeded' };

  // 1. Seed committees
  const committeeData = [
    { name: 'דירקטוריון', type: 'full_board', quorumMinimum: 51, meetingFrequency: 'quarterly' },
    { name: 'ועדת ביקורת', type: 'audit', quorumMinimum: 100, meetingFrequency: 'quarterly' },
    { name: 'ועדת סיכונים', type: 'risk', quorumMinimum: 51, meetingFrequency: 'quarterly' },
    { name: 'ועדת אשראי', type: 'credit', quorumMinimum: 51, meetingFrequency: 'monthly' },
  ];
  const committees = await db.insert(boardCommittees).values(committeeData.map(c => ({ ...c, tenantId: tid }))).returning();
  const cMap: Record<string, string> = {};
  committees.forEach(c => { cMap[c.type] = c.id; });

  // 2. Seed topics
  const topicData: { title: string; group: 'business' | 'regulatory' | 'risk'; interval: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'ad_hoc'; committeeId: string; regulationRef?: string }[] = [
    // דירקטוריון — עסקי
    { title: 'אישור דוחות כספיים', group: 'business', interval: 'quarterly', committeeId: cMap.full_board },
    { title: 'סקירת תוצאות עסקיות', group: 'business', interval: 'monthly', committeeId: cMap.full_board },
    { title: 'אישור תקציב שנתי', group: 'business', interval: 'annual', committeeId: cMap.full_board },
    { title: 'אישור מדיניות תגמול', group: 'business', interval: 'annual', committeeId: cMap.full_board },
    { title: 'אישור עסקאות חריגות', group: 'business', interval: 'ad_hoc', committeeId: cMap.full_board },
    // דירקטוריון — רגולטורי
    { title: 'סקירת עמידה בדרישות רשות ניירות ערך', group: 'regulatory', interval: 'quarterly', committeeId: cMap.full_board, regulationRef: '2024-10-2' },
    { title: 'אישור מדיניות ניהול סיכונים', group: 'regulatory', interval: 'annual', committeeId: cMap.full_board, regulationRef: '2024-10-2 §3' },
    { title: 'עדכון מדיניות אשראי', group: 'regulatory', interval: 'semi_annual', committeeId: cMap.full_board },
    { title: 'סקירת ממצאי ביקורת פנימית', group: 'regulatory', interval: 'quarterly', committeeId: cMap.full_board },
    { title: 'אישור תכנית עבודה ביקורת פנימית', group: 'regulatory', interval: 'annual', committeeId: cMap.full_board },
    { title: 'עדכון נהלי אנטי הלבנת הון', group: 'regulatory', interval: 'annual', committeeId: cMap.full_board },
    { title: 'אישור מדיניות הגנת פרטיות', group: 'regulatory', interval: 'annual', committeeId: cMap.full_board },
    // דירקטוריון — סיכונים
    { title: 'סקירת מפת סיכונים', group: 'risk', interval: 'quarterly', committeeId: cMap.full_board, regulationRef: '2024-10-2 §4' },
    { title: 'עדכון תיאבון סיכון ו-KRI', group: 'risk', interval: 'annual', committeeId: cMap.full_board, regulationRef: '2024-10-2 §5' },
    { title: 'סקירת אירועי סייבר ואובדן', group: 'risk', interval: 'quarterly', committeeId: cMap.full_board, regulationRef: '2022-10-9' },
    { title: 'בחינת מדדי KRI', group: 'risk', interval: 'monthly', committeeId: cMap.full_board },
    { title: 'סקירת תכנית המשכיות עסקית', group: 'risk', interval: 'annual', committeeId: cMap.full_board },
    { title: 'סקירת ספקים קריטיים', group: 'risk', interval: 'semi_annual', committeeId: cMap.full_board },
    // ועדת אשראי — עסקי
    { title: 'אישור מסגרות אשראי', group: 'business', interval: 'monthly', committeeId: cMap.credit },
    { title: 'סקירת תיק האשראי', group: 'business', interval: 'monthly', committeeId: cMap.credit },
    { title: 'אישור חריגות אשראי', group: 'business', interval: 'ad_hoc', committeeId: cMap.credit },
    { title: 'עדכון מדיניות אשראי', group: 'business', interval: 'quarterly', committeeId: cMap.credit },
    { title: 'סקירת חובות בעייתיים', group: 'business', interval: 'monthly', committeeId: cMap.credit },
    // ועדת ביקורת — רגולטורי
    { title: 'סקירת דוחות ביקורת פנימית', group: 'regulatory', interval: 'quarterly', committeeId: cMap.audit },
    { title: 'מעקב אחר ממצאים פתוחים', group: 'regulatory', interval: 'monthly', committeeId: cMap.audit },
    { title: 'אישור תכנית ביקורת שנתית', group: 'regulatory', interval: 'annual', committeeId: cMap.audit },
    { title: 'בחינת בקרות פנימיות', group: 'regulatory', interval: 'semi_annual', committeeId: cMap.audit },
    // ועדת סיכונים — סיכונים
    { title: 'סקירת מפת סיכונים מפורטת', group: 'risk', interval: 'quarterly', committeeId: cMap.risk },
    { title: 'עדכון מסגרת ניהול סיכונים', group: 'risk', interval: 'annual', committeeId: cMap.risk },
    { title: 'בחינת תרחישי קיצון', group: 'risk', interval: 'semi_annual', committeeId: cMap.risk },
    { title: 'סקירת סיכוני סייבר', group: 'risk', interval: 'quarterly', committeeId: cMap.risk },
  ];
  await db.insert(boardTopics).values(topicData.map(t => ({ ...t, tenantId: tid })));

  // 3. Seed demo directors if none exist
  const existingDirs = await db.select().from(directors).where(eq(directors.tenantId, tid));
  if (existingDirs.length === 0) {
    const dirData = [
      { fullName: 'רונית אברהם', role: 'יו"ר דירקטוריון', email: 'ronit@company.co.il', appointmentDate: '2021-01-01' },
      { fullName: 'אבי מזרחי', role: 'דירקטור עצמאי', email: 'avi.m@company.co.il', appointmentDate: '2020-06-15' },
      { fullName: 'מירי שרון', role: 'דירקטורית', email: 'miri@company.co.il', appointmentDate: '2022-03-01' },
      { fullName: 'יוסי כהן', role: 'דירקטור חיצוני', email: 'yossi.k@company.co.il', appointmentDate: '2023-01-15' },
      { fullName: 'דנה לוי', role: 'דירקטורית חיצונית', email: 'dana.l@company.co.il', appointmentDate: '2023-06-01' },
    ];
    const dirs = await db.insert(directors).values(dirData.map(d => ({ ...d, tenantId: tid }))).returning();
    // Assign all directors to full board
    for (const d of dirs) {
      await db.insert(boardCommitteeMembers).values({ committeeId: cMap.full_board, directorId: d.id, tenantId: tid }).onConflictDoNothing();
    }
    // Assign first 3 to audit, risk; first 3 to credit
    for (let i = 0; i < 3; i++) {
      await db.insert(boardCommitteeMembers).values({ committeeId: cMap.audit, directorId: dirs[i].id, tenantId: tid }).onConflictDoNothing();
      await db.insert(boardCommitteeMembers).values({ committeeId: cMap.risk, directorId: dirs[i].id, tenantId: tid }).onConflictDoNothing();
      await db.insert(boardCommitteeMembers).values({ committeeId: cMap.credit, directorId: dirs[i].id, tenantId: tid }).onConflictDoNothing();
    }
  }

  // 4. Seed one demo meeting
  const [demoMeeting] = await db.insert(boardMeetings).values({
    tenantId: tid,
    meetingType: 'ישיבת דירקטוריון רבעונית',
    date: '2026-01-15',
    quarter: 'Q1/2026',
    committeeId: cMap.full_board,
    stage: 'approved',
    status: 'completed',
    time: '14:00',
    location: 'חדר ישיבות ראשי',
    locationType: 'פיזי',
    quorumMet: true,
  }).returning();

  await logAction({ action: 'board.seeded', entity_type: 'board', user_id: user.id, tenant_id: tid, details: { committees: committees.length, topics: topicData.length } });

  return { seeded: true, meetingId: demoMeeting.id };
}

export async function getProtocolApprovals(meetingId: string) {
  const user = await getCurrentUserOrDemo();
  return db.select().from(boardApprovals).where(and(eq(boardApprovals.meetingId, meetingId), eq(boardApprovals.tenantId, user.tenant_id)));
}
