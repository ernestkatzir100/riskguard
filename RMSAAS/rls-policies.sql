-- ═══════════════════════════════════════════════════════════════════════
-- RiskGuard — Row Level Security Policies
-- Run AFTER schema creation, AFTER Supabase Auth is configured
-- Pattern: Every tenant-scoped table gets SELECT/INSERT/UPDATE/DELETE
-- policies that enforce tenant_id = auth.jwt() -> 'tenant_id'
-- ═══════════════════════════════════════════════════════════════════════

-- Helper function: extract tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS uuid AS $$
  SELECT (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid;
$$ LANGUAGE sql STABLE;

-- Helper function: extract user role from JWT
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text AS $$
  SELECT current_setting('request.jwt.claims', true)::json ->> 'user_role';
$$ LANGUAGE sql STABLE;

-- ═══════════════════════════════════════════════
-- SHARED TABLES (No RLS — read-only reference data)
-- regulations, reg_sections, reg_requirements
-- These are seed data accessible to all authenticated users
-- ═══════════════════════════════════════════════

ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regulations_read" ON regulations FOR SELECT TO authenticated USING (true);

ALTER TABLE reg_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reg_sections_read" ON reg_sections FOR SELECT TO authenticated USING (true);

ALTER TABLE reg_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reg_requirements_read" ON reg_requirements FOR SELECT TO authenticated USING (true);

-- ═══════════════════════════════════════════════
-- TENANT-SCOPED TABLES
-- Macro for: SELECT/INSERT/UPDATE where tenant_id matches
-- DELETE restricted to admin role only
-- ═══════════════════════════════════════════════

-- Helper: generate standard RLS for a table
-- We apply this pattern to each table individually

-- ─── TENANTS ───
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenants_select" ON tenants FOR SELECT TO authenticated
  USING (id = auth.tenant_id());
CREATE POLICY "tenants_update" ON tenants FOR UPDATE TO authenticated
  USING (id = auth.tenant_id()) WITH CHECK (id = auth.tenant_id());

-- ─── USERS ───
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select" ON users FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── AUDIT LOG (INSERT only — immutable) ───
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select" ON audit_log FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "audit_insert" ON audit_log FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
-- No UPDATE or DELETE — audit log is immutable

-- ─── COMPLIANCE STATUS ───
ALTER TABLE compliance_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs_select" ON compliance_status FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "cs_insert" ON compliance_status FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "cs_update" ON compliance_status FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── RISKS ───
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risks_select" ON risks FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "risks_insert" ON risks FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "risks_update" ON risks FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "risks_delete" ON risks FOR DELETE TO authenticated
  USING (tenant_id = auth.tenant_id() AND auth.user_role() = 'admin');

-- ─── CONTROLS ───
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "controls_select" ON controls FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "controls_insert" ON controls FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "controls_update" ON controls FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── RISK_CONTROLS (join table — follows risk tenant) ───
ALTER TABLE risk_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rc_select" ON risk_controls FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM risks WHERE risks.id = risk_controls.risk_id AND risks.tenant_id = auth.tenant_id()));
CREATE POLICY "rc_insert" ON risk_controls FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM risks WHERE risks.id = risk_controls.risk_id AND risks.tenant_id = auth.tenant_id()));
CREATE POLICY "rc_delete" ON risk_controls FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM risks WHERE risks.id = risk_controls.risk_id AND risks.tenant_id = auth.tenant_id()));

-- ─── LOSS EVENTS ───
ALTER TABLE loss_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "le_select" ON loss_events FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "le_insert" ON loss_events FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "le_update" ON loss_events FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── RISK ASSESSMENTS ───
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ra_select" ON risk_assessments FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "ra_insert" ON risk_assessments FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "ra_update" ON risk_assessments FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── VENDORS ───
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_select" ON vendors FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "vendors_insert" ON vendors FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "vendors_update" ON vendors FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── VENDOR ASSESSMENTS ───
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "va_select" ON vendor_assessments FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "va_insert" ON vendor_assessments FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "va_update" ON vendor_assessments FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── BCP PLANS ───
ALTER TABLE bcp_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bcp_select" ON bcp_plans FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "bcp_insert" ON bcp_plans FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "bcp_update" ON bcp_plans FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── BCP CRITICAL FUNCTIONS ───
ALTER TABLE bcp_critical_functions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bcf_select" ON bcp_critical_functions FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "bcf_insert" ON bcp_critical_functions FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "bcf_update" ON bcp_critical_functions FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── BCP TESTS ───
ALTER TABLE bcp_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bcpt_select" ON bcp_tests FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "bcpt_insert" ON bcp_tests FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());

-- ─── CYBER INCIDENTS ───
ALTER TABLE cyber_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci_select" ON cyber_incidents FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "ci_insert" ON cyber_incidents FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "ci_update" ON cyber_incidents FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── PEN TESTS ───
ALTER TABLE pen_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pt_select" ON pen_tests FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "pt_insert" ON pen_tests FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());

-- ─── VULN SCANS ───
ALTER TABLE vuln_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vs_select" ON vuln_scans FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "vs_insert" ON vuln_scans FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());

-- ─── DOCUMENTS ───
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_select" ON documents FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "docs_insert" ON documents FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "docs_update" ON documents FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── DOCUMENT VERSIONS ───
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dv_select" ON document_versions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_versions.document_id AND documents.tenant_id = auth.tenant_id()));
CREATE POLICY "dv_insert" ON document_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_versions.document_id AND documents.tenant_id = auth.tenant_id()));

-- ─── TASKS ───
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select" ON tasks FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "tasks_insert" ON tasks FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "tasks_update" ON tasks FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── NOTIFICATIONS ───
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select" ON notifications FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id() AND user_id = auth.uid());
CREATE POLICY "notif_update" ON notifications FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id() AND user_id = auth.uid());

-- ─── DIRECTORS ───
ALTER TABLE directors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dir_select" ON directors FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "dir_insert" ON directors FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "dir_update" ON directors FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── BOARD MEETINGS ───
ALTER TABLE board_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bm_select" ON board_meetings FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "bm_insert" ON board_meetings FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "bm_update" ON board_meetings FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── BOARD DECISIONS ───
ALTER TABLE board_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bdec_select" ON board_decisions FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "bdec_insert" ON board_decisions FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "bdec_update" ON board_decisions FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── PROTOCOL APPROVALS ───
ALTER TABLE protocol_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_select" ON protocol_approvals FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "pa_insert" ON protocol_approvals FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "pa_update" ON protocol_approvals FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── BOARD REPORTS ───
ALTER TABLE board_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brpt_select" ON board_reports FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "brpt_insert" ON board_reports FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());

-- ─── RISK OFFICERS ───
ALTER TABLE risk_officers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ro_select" ON risk_officers FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "ro_insert" ON risk_officers FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "ro_update" ON risk_officers FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ─── KRIs ───
ALTER TABLE kris ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kri_select" ON kris FOR SELECT TO authenticated
  USING (tenant_id = auth.tenant_id());
CREATE POLICY "kri_insert" ON kris FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.tenant_id());
CREATE POLICY "kri_update" ON kris FOR UPDATE TO authenticated
  USING (tenant_id = auth.tenant_id()) WITH CHECK (tenant_id = auth.tenant_id());

-- ═══════════════════════════════════════════════
-- STORAGE POLICIES (Supabase Storage)
-- ═══════════════════════════════════════════════

-- Bucket: tenant-documents (private, per-tenant)
-- Path pattern: {tenant_id}/{module}/{filename}
INSERT INTO storage.buckets (id, name, public) VALUES ('tenant-documents', 'tenant-documents', false);

CREATE POLICY "tenant_docs_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tenant-documents' AND (storage.foldername(name))[1] = auth.tenant_id()::text);
CREATE POLICY "tenant_docs_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tenant-documents' AND (storage.foldername(name))[1] = auth.tenant_id()::text);
CREATE POLICY "tenant_docs_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'tenant-documents' AND (storage.foldername(name))[1] = auth.tenant_id()::text);

-- Bucket: tenant-logos (public read, tenant write)
INSERT INTO storage.buckets (id, name, public) VALUES ('tenant-logos', 'tenant-logos', true);

CREATE POLICY "logos_select" ON storage.objects FOR SELECT USING (bucket_id = 'tenant-logos');
CREATE POLICY "logos_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tenant-logos' AND (storage.foldername(name))[1] = auth.tenant_id()::text);
