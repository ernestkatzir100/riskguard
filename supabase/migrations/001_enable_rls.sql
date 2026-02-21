-- ═══════════════════════════════════════════════════════════════════════
-- RiskGuard — Row Level Security (RLS) Migration
-- Enables tenant isolation on all tenant-scoped tables.
-- Shared tables (tenants, regulations, reg_sections, reg_requirements)
-- are intentionally excluded.
-- ═══════════════════════════════════════════════════════════════════════

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON users
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON users
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON users
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON users
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- AUDIT_LOG
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON audit_log
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON audit_log
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON audit_log
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON audit_log
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- COMPLIANCE_STATUS
ALTER TABLE compliance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_status FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON compliance_status
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON compliance_status
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON compliance_status
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON compliance_status
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- RISKS
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON risks
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON risks
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON risks
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON risks
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- CONTROLS
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON controls
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON controls
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON controls
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON controls
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- LOSS_EVENTS
ALTER TABLE loss_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_events FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON loss_events
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON loss_events
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON loss_events
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON loss_events
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- RISK_ASSESSMENTS
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON risk_assessments
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON risk_assessments
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON risk_assessments
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON risk_assessments
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- VENDORS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON vendors
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON vendors
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON vendors
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON vendors
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- VENDOR_ASSESSMENTS
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON vendor_assessments
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON vendor_assessments
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON vendor_assessments
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON vendor_assessments
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- BCP_PLANS
ALTER TABLE bcp_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcp_plans FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON bcp_plans
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON bcp_plans
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON bcp_plans
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON bcp_plans
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- BCP_CRITICAL_FUNCTIONS
ALTER TABLE bcp_critical_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcp_critical_functions FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON bcp_critical_functions
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON bcp_critical_functions
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON bcp_critical_functions
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON bcp_critical_functions
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- BCP_TESTS
ALTER TABLE bcp_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcp_tests FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON bcp_tests
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON bcp_tests
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON bcp_tests
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON bcp_tests
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- CYBER_INCIDENTS
ALTER TABLE cyber_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cyber_incidents FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON cyber_incidents
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON cyber_incidents
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON cyber_incidents
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON cyber_incidents
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- PEN_TESTS
ALTER TABLE pen_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pen_tests FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON pen_tests
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON pen_tests
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON pen_tests
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON pen_tests
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- VULN_SCANS
ALTER TABLE vuln_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vuln_scans FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON vuln_scans
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON vuln_scans
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON vuln_scans
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON vuln_scans
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- DOCUMENTS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON documents
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON documents
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON documents
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON documents
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- DOCUMENT_VERSIONS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON document_versions
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON document_versions
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON document_versions
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON document_versions
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- TASKS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON tasks
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON tasks
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON tasks
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON tasks
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON notifications
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON notifications
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON notifications
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON notifications
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- DIRECTORS
ALTER TABLE directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE directors FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON directors
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON directors
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON directors
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON directors
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- BOARD_MEETINGS
ALTER TABLE board_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_meetings FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON board_meetings
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON board_meetings
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON board_meetings
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON board_meetings
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- BOARD_DECISIONS
ALTER TABLE board_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_decisions FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON board_decisions
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON board_decisions
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON board_decisions
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON board_decisions
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- PROTOCOL_APPROVALS
ALTER TABLE protocol_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_approvals FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON protocol_approvals
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON protocol_approvals
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON protocol_approvals
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON protocol_approvals
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- BOARD_REPORTS
ALTER TABLE board_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_reports FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON board_reports
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON board_reports
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON board_reports
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON board_reports
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- RISK_OFFICERS
ALTER TABLE risk_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_officers FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON risk_officers
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON risk_officers
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON risk_officers
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON risk_officers
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- KRIS
ALTER TABLE kris ENABLE ROW LEVEL SECURITY;
ALTER TABLE kris FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON kris
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_insert" ON kris
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_update" ON kris
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "tenant_isolation_delete" ON kris
  FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
