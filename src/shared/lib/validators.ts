import { z } from 'zod';

// ═══════════════════════════════════════════════
// Risk Management
// ═══════════════════════════════════════════════

export const createRiskSchema = z.object({
  title: z.string().min(1, 'שם הסיכון נדרש'),
  description: z.string().optional(),
  category: z.enum(['operational', 'fraud', 'outsourcing', 'cyber', 'bcp', 'credit', 'governance']),
  probability: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  status: z.enum(['open', 'mitigated', 'accepted', 'closed']).default('open'),
  ownerId: z.string().uuid().optional(),
  module: z.enum(['governance', 'operational', 'outsourcing', 'bcp', 'cyber_governance', 'cyber_protection', 'cyber_incidents', 'credit', 'board']).optional(),
  regulationCode: z.string().max(50).optional(),
  sectionRef: z.string().max(50).optional(),
  reqCode: z.string().max(30).optional(),
});
export type CreateRiskInput = z.infer<typeof createRiskSchema>;

export const updateRiskSchema = createRiskSchema.partial();
export type UpdateRiskInput = z.infer<typeof updateRiskSchema>;

// ═══════════════════════════════════════════════
// Controls
// ═══════════════════════════════════════════════

export const createControlSchema = z.object({
  title: z.string().min(1, 'שם הבקרה נדרש'),
  description: z.string().optional(),
  type: z.enum(['preventive', 'detective', 'corrective']),
  frequency: z.enum(['continuous', 'periodic', 'ad_hoc']).default('periodic'),
  effectiveness: z.enum(['effective', 'partially_effective', 'ineffective', 'untested']).default('untested'),
  effectivenessScore: z.number().int().min(1).max(5).optional(),
  ownerId: z.string().uuid().optional(),
  regulationCode: z.string().max(50).optional(),
  sectionRef: z.string().max(50).optional(),
  reqCode: z.string().max(30).optional(),
});
export type CreateControlInput = z.infer<typeof createControlSchema>;

export const updateControlSchema = createControlSchema.partial();

// ═══════════════════════════════════════════════
// Vendors / Outsourcing
// ═══════════════════════════════════════════════

export const createVendorSchema = z.object({
  name: z.string().min(1, 'שם הספק נדרש'),
  serviceDescription: z.string().optional(),
  criticality: z.enum(['critical', 'important', 'standard']).default('standard'),
  status: z.enum(['active', 'under_review', 'terminated']).default('active'),
  contractStart: z.string().optional(),
  contractEnd: z.string().optional(),
  annualValueNis: z.string().optional(),
  riskRating: z.number().int().min(1).max(5).optional(),
  contactName: z.string().max(255).optional(),
  contactEmail: z.string().email().optional(),
});
export type CreateVendorInput = z.infer<typeof createVendorSchema>;

export const updateVendorSchema = createVendorSchema.partial();

export const createVendorAssessmentSchema = z.object({
  vendorId: z.string().uuid(),
  assessmentDate: z.string(),
  riskScore: z.number().int().min(1).max(10).optional(),
  dataAccessLevel: z.string().max(50).optional(),
  exitStrategyExists: z.boolean().default(false),
  findings: z.record(z.unknown()).optional(),
  nextReview: z.string().optional(),
});

// ═══════════════════════════════════════════════
// Tasks
// ═══════════════════════════════════════════════

export const createTaskSchema = z.object({
  title: z.string().min(1, 'שם המשימה נדרש'),
  description: z.string().optional(),
  module: z.enum(['governance', 'operational', 'outsourcing', 'bcp', 'cyber_governance', 'cyber_protection', 'cyber_incidents', 'credit', 'board']).optional(),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).default('pending'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  dueDate: z.string().optional(),
  regulationCode: z.string().max(50).optional(),
  sectionRef: z.string().max(50).optional(),
  reqCode: z.string().max(30).optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();

// ═══════════════════════════════════════════════
// Documents
// ═══════════════════════════════════════════════

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'שם המסמך נדרש'),
  type: z.enum(['policy', 'procedure', 'report', 'assessment', 'template', 'evidence']),
  module: z.enum(['governance', 'operational', 'outsourcing', 'bcp', 'cyber_governance', 'cyber_protection', 'cyber_incidents', 'credit', 'board']).optional(),
  version: z.string().max(20).default('1.0'),
  status: z.enum(['draft', 'pending_approval', 'approved', 'expired']).default('draft'),
  content: z.record(z.unknown()).optional(),
  expiresAt: z.string().optional(),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

// ═══════════════════════════════════════════════
// Cyber Incidents
// ═══════════════════════════════════════════════

export const createIncidentSchema = z.object({
  title: z.string().min(1, 'שם האירוע נדרש'),
  description: z.string().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['detected', 'investigating', 'contained', 'resolved', 'closed']).default('detected'),
  incidentType: z.string().max(50).optional(),
  detectedAt: z.string(),
  dataExposed: z.boolean().default(false),
  rootCause: z.string().optional(),
  remediation: z.string().optional(),
});
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export const updateIncidentSchema = createIncidentSchema.partial();

// ═══════════════════════════════════════════════
// Board Management
// ═══════════════════════════════════════════════

export const createBoardMeetingSchema = z.object({
  meetingType: z.string().min(1, 'סוג ישיבה נדרש'),
  date: z.string(),
  quarter: z.string().max(10).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  agenda: z.array(z.string()).default([]),
  attendees: z.array(z.string()).default([]),
});
export type CreateBoardMeetingInput = z.infer<typeof createBoardMeetingSchema>;

export const createBoardDecisionSchema = z.object({
  meetingId: z.string().uuid(),
  text: z.string().min(1, 'תוכן ההחלטה נדרש'),
  ownerName: z.string().max(255).optional(),
  ownerId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'done']).default('pending'),
});
export type CreateBoardDecisionInput = z.infer<typeof createBoardDecisionSchema>;

// ═══════════════════════════════════════════════
// KRIs
// ═══════════════════════════════════════════════

export const createKRISchema = z.object({
  name: z.string().min(1, 'שם המדד נדרש'),
  module: z.enum(['governance', 'operational', 'outsourcing', 'bcp', 'cyber_governance', 'cyber_protection', 'cyber_incidents', 'credit', 'board']).optional(),
  threshold: z.string().max(50).optional(),
  currentValue: z.string().max(50).optional(),
  previousValue: z.string().max(50).optional(),
  trend: z.enum(['improving', 'stable', 'deteriorating']).optional(),
  breached: z.boolean().default(false),
});
export type CreateKRIInput = z.infer<typeof createKRISchema>;

export const updateKRISchema = createKRISchema.partial();

// ═══════════════════════════════════════════════
// Compliance Status
// ═══════════════════════════════════════════════

export const updateComplianceStatusSchema = z.object({
  requirementId: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'compliant', 'non_compliant', 'not_applicable']),
  notes: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
});
export type UpdateComplianceStatusInput = z.infer<typeof updateComplianceStatusSchema>;

// ═══════════════════════════════════════════════
// Onboarding & Settings
// ═══════════════════════════════════════════════

export const onboardingSchema = z.object({
  companyName: z.string().min(1, 'שם החברה נדרש'),
  companyId: z.string().max(20).optional(),
  licenseType: z.enum(['extended_credit', 'basic_credit', 'service_provider']).default('extended_credit'),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  employeeCount: z.string().optional(),
  portfolioSize: z.string().optional(),
  clientCount: z.string().optional(),
  clientTypes: z.array(z.string()).default([]),
  riskOfficerName: z.string().optional(),
  riskOfficerEmail: z.string().email().optional(),
  directors: z.array(z.object({
    fullName: z.string().min(1),
    role: z.string().default('דירקטור'),
    email: z.string().email().optional(),
  })).default([]),
  inviteEmails: z.array(z.string().email()).default([]),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  companyId: z.string().max(20).optional(),
  licenseType: z.enum(['extended_credit', 'basic_credit', 'service_provider']).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  employeeCount: z.string().optional(),
  portfolioSize: z.string().optional(),
  clientCount: z.string().optional(),
  clientTypes: z.array(z.string()).optional(),
  settings: z.record(z.unknown()).optional(),
  logoUrl: z.string().optional(),
});

// ═══════════════════════════════════════════════
// Directors
// ═══════════════════════════════════════════════

export const createDirectorSchema = z.object({
  fullName: z.string().min(1, 'שם נדרש'),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  role: z.string().max(100).default('דירקטור'),
  appointmentDate: z.string().optional(),
});

// ═══════════════════════════════════════════════
// Loss Events
// ═══════════════════════════════════════════════

export const createLossEventSchema = z.object({
  title: z.string().min(1, 'שם האירוע נדרש'),
  description: z.string().optional(),
  category: z.enum(['operational', 'fraud', 'outsourcing', 'cyber', 'bcp', 'credit', 'governance']),
  amountNis: z.string().optional(),
  eventDate: z.string(),
  discoveryDate: z.string().optional(),
  rootCause: z.string().optional(),
  correctiveActions: z.string().optional(),
  riskId: z.string().uuid().optional(),
});

// ═══════════════════════════════════════════════
// BCP
// ═══════════════════════════════════════════════

export const updateBCPPlanSchema = z.object({
  version: z.string().max(20).optional(),
  status: z.string().max(20).optional(),
  content: z.record(z.unknown()).optional(),
  nextReview: z.string().optional(),
});

export const createBCPTestSchema = z.object({
  testType: z.string().max(30),
  testDate: z.string(),
  participants: z.array(z.string()).default([]),
  scenario: z.string().optional(),
  results: z.string().optional(),
  findings: z.string().optional(),
  lessonsLearned: z.string().optional(),
  nextTestDate: z.string().optional(),
});

// ═══════════════════════════════════════════════
// Risk Officer
// ═══════════════════════════════════════════════

export const updateRiskOfficerSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  roles: z.array(z.string()).optional(),
  reportingLine: z.string().max(100).optional(),
  appointmentDate: z.string().optional(),
});
