// ═══════════════════════════════════════════════════════════════════════
// RiskGuard — Database Schema (Drizzle ORM)
// Source: Architecture Document v1.0, Section 5
// Stack: PostgreSQL 15+ via Supabase, Drizzle ORM
// Pattern: Multi-tenant with RLS, tenant_id on every scoped table
// ═══════════════════════════════════════════════════════════════════════

import {
  pgTable, pgEnum, uuid, text, varchar, integer, boolean, timestamp,
  decimal, jsonb, bigserial, date, index, uniqueIndex,
} from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════

export const licenseTypeEnum = pgEnum('license_type', [
  'extended_credit', 'basic_credit', 'service_provider',
]);

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'starter', 'pro', 'enterprise',
]);

export const userRoleEnum = pgEnum('user_role', [
  'admin', 'risk_manager', 'viewer', 'auditor',
]);

export const riskCategoryEnum = pgEnum('risk_category', [
  'operational', 'fraud', 'outsourcing', 'cyber', 'bcp', 'credit', 'governance',
]);

export const riskStatusEnum = pgEnum('risk_status', [
  'open', 'mitigated', 'accepted', 'closed',
]);

export const controlTypeEnum = pgEnum('control_type', [
  'preventive', 'detective', 'corrective',
]);

export const controlFrequencyEnum = pgEnum('control_frequency', [
  'continuous', 'periodic', 'ad_hoc',
]);

export const effectivenessEnum = pgEnum('effectiveness', [
  'effective', 'partially_effective', 'ineffective', 'untested',
]);

export const complianceStatusEnum = pgEnum('compliance_status_type', [
  'not_started', 'in_progress', 'compliant', 'non_compliant', 'not_applicable',
]);

export const priorityEnum = pgEnum('priority', [
  'P0', 'P1', 'P2',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'pending', 'in_progress', 'completed', 'overdue',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'high', 'medium', 'low',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'policy', 'procedure', 'report', 'assessment', 'template', 'evidence',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'draft', 'pending_approval', 'approved', 'expired',
]);

export const moduleEnum = pgEnum('module', [
  'governance', 'operational', 'outsourcing', 'bcp',
  'cyber_governance', 'cyber_protection', 'cyber_incidents',
  'credit', 'board',
]);

export const vendorCriticalityEnum = pgEnum('vendor_criticality', [
  'critical', 'important', 'standard',
]);

export const vendorStatusEnum = pgEnum('vendor_status', [
  'active', 'under_review', 'terminated',
]);

export const frequencyEnum = pgEnum('requirement_frequency', [
  'one_time', 'annual', 'quarterly', 'biennial', '36_months',
]);

export const incidentSeverityEnum = pgEnum('incident_severity', [
  'critical', 'high', 'medium', 'low',
]);

export const incidentStatusEnum = pgEnum('incident_status', [
  'detected', 'investigating', 'contained', 'resolved', 'closed',
]);

export const boardMeetingStatusEnum = pgEnum('board_meeting_status', [
  'scheduled', 'completed', 'cancelled',
]);

export const protocolApprovalEnum = pgEnum('protocol_approval_status', [
  'pending', 'approved', 'commented', 'rejected',
]);

// ═══════════════════════════════════════════════
// 5.1 CORE TABLES (Multi-Tenancy & Auth)
// ═══════════════════════════════════════════════

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  companyId: varchar('company_id', { length: 20 }), // ח.פ. / ח.צ.
  licenseType: licenseTypeEnum('license_type').notNull().default('extended_credit'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('starter'),
  logoUrl: text('logo_url'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  employeeCount: varchar('employee_count', { length: 20 }),
  portfolioSize: varchar('portfolio_size', { length: 50 }),
  clientCount: varchar('client_count', { length: 50 }),
  clientTypes: jsonb('client_types').$type<string[]>().default([]),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
  locale: varchar('locale', { length: 5 }).notNull().default('he'),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // = auth.uid from Supabase Auth
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: varchar('email', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  phone: varchar('phone', { length: 30 }),
  jobTitle: varchar('job_title', { length: 255 }),
  lastLogin: timestamp('last_login'),
  isSuperAdmin: boolean('is_super_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('users_tenant_idx').on(t.tenantId),
  emailIdx: uniqueIndex('users_email_idx').on(t.email),
}));

export const auditLog = pgTable('audit_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(), // e.g. 'risk.created'
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('audit_tenant_idx').on(t.tenantId),
  entityIdx: index('audit_entity_idx').on(t.entityType, t.entityId),
  timestampIdx: index('audit_timestamp_idx').on(t.timestamp),
}));

// ═══════════════════════════════════════════════
// 5.2 REGULATORY FRAMEWORK TABLES (Shared — no RLS)
// ═══════════════════════════════════════════════

export const regulations = pgTable('regulations', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. '2024-10-2'
  nameHe: varchar('name_he', { length: 500 }).notNull(),
  nameEn: varchar('name_en', { length: 500 }),
  countryCode: varchar('country_code', { length: 5 }).notNull().default('IL'),
  effectiveDate: date('effective_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
});

export const regSections = pgTable('reg_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  regulationId: uuid('regulation_id').notNull().references(() => regulations.id),
  parentId: uuid('parent_id'), // self-FK for tree structure
  sectionRef: varchar('section_ref', { length: 50 }).notNull(), // e.g. '2(b)(4)'
  titleHe: text('title_he').notNull(),
  titleEn: text('title_en'),
  contentHe: text('content_he'),
  contentEn: text('content_en'),
  level: integer('level').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => ({
  regIdx: index('regsec_reg_idx').on(t.regulationId),
  parentIdx: index('regsec_parent_idx').on(t.parentId),
}));

export const regRequirements = pgTable('reg_requirements', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').notNull().references(() => regSections.id),
  requirementHe: text('requirement_he').notNull(),
  requirementEn: text('requirement_en'),
  frequency: frequencyEnum('frequency').notNull().default('annual'),
  priority: priorityEnum('priority').notNull().default('P1'),
  tier: subscriptionTierEnum('tier').notNull().default('starter'),
  module: moduleEnum('module').notNull(),
  featureHe: text('feature_he'), // system feature that addresses this
  reqCode: varchar('req_code', { length: 30 }), // e.g. 'GOV-01', 'CYB-PRO-05'
}, (t) => ({
  sectionIdx: index('regreq_section_idx').on(t.sectionId),
  moduleIdx: index('regreq_module_idx').on(t.module),
}));

// ═══════════════════════════════════════════════
// COMPLIANCE STATUS (Tenant-scoped)
// ═══════════════════════════════════════════════

export const complianceStatus = pgTable('compliance_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  requirementId: uuid('requirement_id').notNull().references(() => regRequirements.id),
  status: complianceStatusEnum('status').notNull().default('not_started'),
  evidenceIds: jsonb('evidence_ids').$type<string[]>().default([]),
  lastReviewed: timestamp('last_reviewed'),
  nextReview: timestamp('next_review'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('cs_tenant_idx').on(t.tenantId),
  reqIdx: index('cs_req_idx').on(t.requirementId),
  tenantReqIdx: uniqueIndex('cs_tenant_req_idx').on(t.tenantId, t.requirementId),
}));

// ═══════════════════════════════════════════════
// 5.3 RISK MANAGEMENT TABLES
// ═══════════════════════════════════════════════

export const risks = pgTable('risks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  description: text('description'),
  category: riskCategoryEnum('category').notNull(),
  probability: integer('probability').notNull(), // 1-5
  impact: integer('impact').notNull(), // 1-5
  riskScore: integer('risk_score').notNull(), // computed: probability * impact
  status: riskStatusEnum('status').notNull().default('open'),
  ownerId: uuid('owner_id').references(() => users.id),
  requirementId: uuid('requirement_id').references(() => regRequirements.id),
  module: moduleEnum('module'),
  regulationCode: varchar('regulation_code', { length: 50 }),
  sectionRef: varchar('section_ref', { length: 50 }),
  reqCode: varchar('req_code', { length: 30 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('risks_tenant_idx').on(t.tenantId),
  categoryIdx: index('risks_cat_idx').on(t.category),
}));

export const controls = pgTable('controls', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  description: text('description'),
  type: controlTypeEnum('type').notNull(),
  frequency: controlFrequencyEnum('frequency').notNull().default('periodic'),
  effectiveness: effectivenessEnum('effectiveness').notNull().default('untested'),
  effectivenessScore: integer('effectiveness_score'), // 1-5
  ownerId: uuid('owner_id').references(() => users.id),
  regulationCode: varchar('regulation_code', { length: 50 }),
  sectionRef: varchar('section_ref', { length: 50 }),
  reqCode: varchar('req_code', { length: 30 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('controls_tenant_idx').on(t.tenantId),
}));

export const riskControls = pgTable('risk_controls', {
  riskId: uuid('risk_id').notNull().references(() => risks.id, { onDelete: 'cascade' }),
  controlId: uuid('control_id').notNull().references(() => controls.id, { onDelete: 'cascade' }),
  relationshipType: varchar('relationship_type', { length: 20 }).notNull().default('primary'),
}, (t) => ({
  pk: uniqueIndex('rc_pk').on(t.riskId, t.controlId),
}));

export const lossEvents = pgTable('loss_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  description: text('description'),
  category: riskCategoryEnum('category').notNull(),
  amountNis: decimal('amount_nis', { precision: 15, scale: 2 }),
  eventDate: date('event_date').notNull(),
  discoveryDate: date('discovery_date'),
  rootCause: text('root_cause'),
  correctiveActions: text('corrective_actions'),
  riskId: uuid('risk_id').references(() => risks.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('loss_tenant_idx').on(t.tenantId),
}));

export const riskAssessments = pgTable('risk_assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(),
  period: varchar('period', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  findings: jsonb('findings').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('ra_tenant_idx').on(t.tenantId),
}));

// ═══════════════════════════════════════════════
// 5.4 OUTSOURCING & VENDOR TABLES
// ═══════════════════════════════════════════════

export const vendors = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  serviceDescription: text('service_description'),
  criticality: vendorCriticalityEnum('criticality').notNull().default('standard'),
  status: vendorStatusEnum('status').notNull().default('active'),
  contractStart: date('contract_start'),
  contractEnd: date('contract_end'),
  annualValueNis: decimal('annual_value_nis', { precision: 15, scale: 2 }),
  riskRating: integer('risk_rating'), // 1-5
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('vendors_tenant_idx').on(t.tenantId),
}));

export const vendorAssessments = pgTable('vendor_assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  assessmentDate: date('assessment_date').notNull(),
  riskScore: integer('risk_score'),
  dataAccessLevel: varchar('data_access_level', { length: 50 }),
  exitStrategyExists: boolean('exit_strategy_exists').default(false),
  findings: jsonb('findings').$type<Record<string, unknown>>(),
  nextReview: date('next_review'),
  assessorId: uuid('assessor_id').references(() => users.id),
}, (t) => ({
  tenantIdx: index('va_tenant_idx').on(t.tenantId),
}));

// ═══════════════════════════════════════════════
// 5.5 BUSINESS CONTINUITY TABLES
// ═══════════════════════════════════════════════

export const bcpPlans = pgTable('bcp_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  version: varchar('version', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  content: jsonb('content').$type<Record<string, unknown>>(),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  nextReview: date('next_review'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('bcp_tenant_idx').on(t.tenantId),
}));

export const bcpCriticalFunctions = pgTable('bcp_critical_functions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  functionName: text('function_name').notNull(),
  department: varchar('department', { length: 100 }),
  rtoHours: integer('rto_hours'),
  rpoHours: integer('rpo_hours'),
  impactLevel: integer('impact_level'), // 1-5
  dependencies: text('dependencies'),
  recoveryProcedure: text('recovery_procedure'),
  priorityOrder: integer('priority_order'),
}, (t) => ({
  tenantIdx: index('bcp_cf_tenant_idx').on(t.tenantId),
}));

export const bcpTests = pgTable('bcp_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  testType: varchar('test_type', { length: 30 }).notNull(), // tabletop/partial/full
  testDate: date('test_date').notNull(),
  participants: jsonb('participants').$type<string[]>(),
  scenario: text('scenario'),
  results: text('results'),
  findings: text('findings'),
  lessonsLearned: text('lessons_learned'),
  nextTestDate: date('next_test_date'),
}, (t) => ({
  tenantIdx: index('bcp_tests_tenant_idx').on(t.tenantId),
}));

// ═══════════════════════════════════════════════
// 5.6 CYBER SECURITY TABLES
// ═══════════════════════════════════════════════

export const cyberIncidents = pgTable('cyber_incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  description: text('description'),
  severity: incidentSeverityEnum('severity').notNull(),
  status: incidentStatusEnum('status').notNull().default('detected'),
  incidentType: varchar('incident_type', { length: 50 }), // phishing/ransomware/ddos/data_leak
  detectedAt: timestamp('detected_at').notNull(),
  resolvedAt: timestamp('resolved_at'),
  dataExposed: boolean('data_exposed').default(false),
  regulatorReported: boolean('regulator_reported').default(false),
  regulatorReportDate: timestamp('regulator_report_date'),
  rootCause: text('root_cause'),
  remediation: text('remediation'),
  lessonsLearned: text('lessons_learned'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('ci_tenant_idx').on(t.tenantId),
}));

export const penTests = pgTable('pen_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  testType: varchar('test_type', { length: 50 }).notNull(),
  vendorName: varchar('vendor_name', { length: 255 }),
  testDate: date('test_date').notNull(),
  scope: text('scope'),
  findingsCountCritical: integer('findings_count_critical').default(0),
  findingsCountHigh: integer('findings_count_high').default(0),
  findingsCountMedium: integer('findings_count_medium').default(0),
  findingsCountLow: integer('findings_count_low').default(0),
  reportUploadId: uuid('report_upload_id'),
  nextTest: date('next_test'),
}, (t) => ({
  tenantIdx: index('pt_tenant_idx').on(t.tenantId),
}));

export const vulnScans = pgTable('vuln_scans', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  scanType: varchar('scan_type', { length: 30 }).notNull(),
  scanDate: date('scan_date').notNull(),
  toolUsed: varchar('tool_used', { length: 100 }),
  totalFindings: integer('total_findings').default(0),
  criticalFindings: integer('critical_findings').default(0),
  remediatedCount: integer('remediated_count').default(0),
  reportUploadId: uuid('report_upload_id'),
}, (t) => ({
  tenantIdx: index('vs_tenant_idx').on(t.tenantId),
}));

// ═══════════════════════════════════════════════
// 5.7 DOCUMENT & TASK TABLES
// ═══════════════════════════════════════════════

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  type: documentTypeEnum('type').notNull(),
  module: moduleEnum('module'),
  templateId: uuid('template_id'), // FK to reg_requirements if applicable
  version: varchar('version', { length: 20 }).default('1.0'),
  status: documentStatusEnum('status').notNull().default('draft'),
  content: jsonb('content').$type<Record<string, unknown>>(),
  filePath: text('file_path'), // Supabase Storage URL
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  expiresAt: timestamp('expires_at'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('docs_tenant_idx').on(t.tenantId),
  moduleIdx: index('docs_module_idx').on(t.module),
}));

export const documentVersions = pgTable('document_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  versionNumber: varchar('version_number', { length: 20 }).notNull(),
  contentSnapshot: jsonb('content_snapshot').$type<Record<string, unknown>>(),
  changedBy: uuid('changed_by').references(() => users.id),
  changeSummary: text('change_summary'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('dv_tenant_idx').on(t.tenantId),
}));

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  description: text('description'),
  module: moduleEnum('module'),
  requirementId: uuid('requirement_id').references(() => regRequirements.id),
  assignedTo: uuid('assigned_to').references(() => users.id),
  status: taskStatusEnum('status').notNull().default('pending'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  recurrence: jsonb('recurrence').$type<{ frequency: string; nextDue: string }>(),
  evidenceIds: jsonb('evidence_ids').$type<string[]>().default([]),
  regulationCode: varchar('regulation_code', { length: 50 }),
  sectionRef: varchar('section_ref', { length: 50 }),
  reqCode: varchar('req_code', { length: 30 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('tasks_tenant_idx').on(t.tenantId),
  statusIdx: index('tasks_status_idx').on(t.status),
  dueIdx: index('tasks_due_idx').on(t.dueDate),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: text('title').notNull(),
  body: text('body'),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  read: boolean('read').notNull().default(false),
  emailSent: boolean('email_sent').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('notif_user_idx').on(t.userId),
}));

// ═══════════════════════════════════════════════
// 5.8 BOARD / CORPORATE GOVERNANCE TABLES
// ═══════════════════════════════════════════════

export const directors = pgTable('directors', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  role: varchar('role', { length: 100 }).notNull().default('דירקטור'),
  appointmentDate: date('appointment_date'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('directors_tenant_idx').on(t.tenantId),
}));

export const boardMeetings = pgTable('board_meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  meetingType: varchar('meeting_type', { length: 100 }).notNull(), // e.g. 'ישיבת דירקטוריון רבעונית'
  date: date('date').notNull(),
  quarter: varchar('quarter', { length: 10 }),
  status: boardMeetingStatusEnum('status').notNull().default('scheduled'),
  agenda: jsonb('agenda').$type<string[]>().default([]),
  summary: text('summary'),
  attendees: jsonb('attendees').$type<string[]>().default([]),
  agendaSentAt: timestamp('agenda_sent_at'),
  summarySentAt: timestamp('summary_sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('bm_tenant_idx').on(t.tenantId),
  dateIdx: index('bm_date_idx').on(t.date),
}));

export const boardDecisions = pgTable('board_decisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  meetingId: uuid('meeting_id').notNull().references(() => boardMeetings.id),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  text: text('text').notNull(),
  ownerId: uuid('owner_id').references(() => users.id),
  ownerName: varchar('owner_name', { length: 255 }),
  dueDate: date('due_date'),
  status: varchar('status', { length: 30 }).notNull().default('pending'), // pending/in_progress/done
  taskId: uuid('task_id').references(() => tasks.id), // linked task for tracking
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  meetingIdx: index('bd_meeting_idx').on(t.meetingId),
  tenantIdx: index('bd_tenant_idx').on(t.tenantId),
}));

export const protocolApprovals = pgTable('protocol_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  meetingId: uuid('meeting_id').notNull().references(() => boardMeetings.id),
  directorId: uuid('director_id').notNull().references(() => directors.id),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  status: protocolApprovalEnum('status').notNull().default('pending'),
  comments: text('comments'),
  trackChanges: jsonb('track_changes').$type<Record<string, unknown>>(),
  approvedAt: timestamp('approved_at'),
  reminderSentAt: timestamp('reminder_sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  meetingDirIdx: uniqueIndex('pa_meeting_dir_idx').on(t.meetingId, t.directorId),
  tenantIdx: index('pa_tenant_idx').on(t.tenantId),
}));

export const boardReports = pgTable('board_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  meetingId: uuid('meeting_id').references(() => boardMeetings.id),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  documentId: uuid('document_id').references(() => documents.id),
  generatedBy: varchar('generated_by', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('br_tenant_idx').on(t.tenantId),
}));

// ═══════════════════════════════════════════════
// 5.9 RISK OFFICER PROFILE
// ═══════════════════════════════════════════════

export const riskOfficers = pgTable('risk_officers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id).unique(),
  userId: uuid('user_id').references(() => users.id),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  roles: jsonb('roles').$type<string[]>().default([]), // e.g. ['מנהל סיכונים', 'קצין ציות']
  reportingLine: varchar('reporting_line', { length: 100 }),
  appointmentDate: date('appointment_date'),
  appointmentDocId: uuid('appointment_doc_id').references(() => documents.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════
// 5.10 KRI (Key Risk Indicators) — Pro Tier
// ═══════════════════════════════════════════════

export const kris = pgTable('kris', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  module: moduleEnum('module'),
  threshold: varchar('threshold', { length: 50 }),
  currentValue: varchar('current_value', { length: 50 }),
  previousValue: varchar('previous_value', { length: 50 }),
  trend: varchar('trend', { length: 20 }), // improving/stable/deteriorating
  breached: boolean('breached').notNull().default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('kris_tenant_idx').on(t.tenantId),
}));

// ═══════════════════════════════════════════════
// 5.11 NuTeLa AGENT PUSHES (Super Admin)
// ═══════════════════════════════════════════════

export const nutelaPushTypeEnum = pgEnum('nutela_push_type', [
  'task', 'questionnaire',
]);

export const nutelaPushStatusEnum = pgEnum('nutela_push_status', [
  'pending', 'sent', 'answered', 'overdue',
]);

export const nutelaPushes = pgTable('nutela_pushes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  type: nutelaPushTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: nutelaPushStatusEnum('status').notNull().default('pending'),
  schedule: varchar('schedule', { length: 20 }), // null (one-time) | 'weekly' | 'monthly'
  generatedBy: varchar('generated_by', { length: 50 }), // 'manual' | 'nutela_ai'
  pushedBy: uuid('pushed_by').references(() => users.id),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  tenantIdx: index('np_tenant_idx').on(t.tenantId),
  statusIdx: index('np_status_idx').on(t.status),
}));
