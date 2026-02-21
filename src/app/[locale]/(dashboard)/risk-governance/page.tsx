'use client';

import { useState, useEffect } from 'react';
import {
  Shield, BookOpen, CheckSquare,
  Phone, Mail, Award, User, FileText,
  ChevronDown, ChevronRight,
} from 'lucide-react';

import { getComplianceStatus } from '@/app/actions/compliance';
import { getRiskOfficer } from '@/app/actions/settings';
import { getDocuments } from '@/app/actions/documents';
import { C } from '@/shared/lib/design-tokens';
import { ScoreRing } from '@/shared/components/score-ring';

/* ═══════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════ */
type VersionEntry = { version: string; date: string; note: string; author: string };

type Policy = {
  id: string;
  name: string;
  status: 'approved' | 'draft' | 'expired';
  version: string;
  boardApproval: string;
  expiry: string;
  history: VersionEntry[];
};

const POLICIES: Policy[] = [
  {
    id: 'POL-01',
    name: 'מדיניות ניהול סיכונים 2026',
    status: 'approved',
    version: '3.0',
    boardApproval: '15/01/2026',
    expiry: '31/12/2026',
    history: [
      { version: 'v3.0', date: '15/01/2026', note: 'אושר ע"י דירקטוריון', author: 'יוסי לוי' },
      { version: 'v2.0', date: '01/01/2025', note: 'עדכון שנתי', author: 'יוסי לוי' },
      { version: 'v1.0', date: '15/03/2024', note: 'גרסה ראשונה', author: 'יוסי לוי' },
    ],
  },
  {
    id: 'POL-02',
    name: 'מדיניות מיקור חוץ',
    status: 'draft',
    version: '1.1',
    boardApproval: '—',
    expiry: '30/06/2026',
    history: [],
  },
  {
    id: 'POL-03',
    name: 'מדיניות אבטחת מידע 2024',
    status: 'expired',
    version: '2.0',
    boardApproval: '10/01/2024',
    expiry: '31/12/2025',
    history: [
      { version: 'v2.0', date: '10/01/2024', note: 'עדכון שנתי', author: 'דנה כהן' },
      { version: 'v1.0', date: '15/02/2023', note: 'גרסה ראשונה', author: 'דנה כהן' },
    ],
  },
];

const OFFICER = {
  name: 'יוסי לוי',
  role: 'מנהל סיכונים',
  phone: '050-1234567',
  email: 'yossi@credit-finance.co.il',
  appointmentLetter: true,
  reportingTo: 'CEO (אבי שרון)',
  certifications: ['FRM', 'ISO 31000'],
};

const POLICY_STATUS = {
  approved: { l: 'מאושר', c: C.success, bg: C.successBg },
  draft: { l: 'טיוטה', c: C.warning, bg: C.warningBg },
  expired: { l: 'פג תוקף', c: C.danger, bg: C.dangerBg },
};

/* ═══════════════════════════════════════════════
   RiskGovernancePage
   ═══════════════════════════════════════════════ */
export default function RiskGovernancePage() {
  const [policies, setPolicies] = useState<Policy[]>(POLICIES);
  const [officer, setOfficer] = useState(OFFICER);

  useEffect(() => {
    async function loadData() {
      try {
        const [statusRes, officerRes, docsRes] = await Promise.all([
          getComplianceStatus(),
          getRiskOfficer(),
          getDocuments({ type: 'policy' }),
        ]);
        if (officerRes) {
          const o = officerRes as Record<string, unknown>;
          setOfficer({
            name: String(o.fullName ?? OFFICER.name),
            role: 'מנהל סיכונים',
            phone: String(o.phone ?? OFFICER.phone),
            email: String(o.email ?? OFFICER.email),
            appointmentLetter: !!o.appointmentDate,
            reportingTo: String(o.reportingLine ?? OFFICER.reportingTo),
            certifications: Array.isArray(o.certifications) ? o.certifications as string[] : OFFICER.certifications,
          });
        }
        if (docsRes?.length) {
          const statusMap: Record<string, Policy['status']> = { approved: 'approved', draft: 'draft', expired: 'expired', pending_approval: 'draft' };
          setPolicies(docsRes.map((d: Record<string, unknown>, i: number) => ({
            id: `POL-${String(i + 1).padStart(2, '0')}`,
            name: String(d.title ?? ''),
            status: statusMap[String(d.status)] ?? 'draft',
            version: String(d.version ?? '1.0'),
            boardApproval: d.updatedAt ? new Date(d.updatedAt as string).toLocaleDateString('he-IL') : '—',
            expiry: '—',
            history: [],
          })));
        }
        void statusRes;
      } catch { /* demo fallback */ }
    }
    loadData();
  }, []);

  const [expandedPolicy, setExpandedPolicy] = useState<string | null>('POL-01');

  const complianceScore = 78;
  const requirementsMet = 7;
  const requirementsTotal = 9;
  const activePolicies = 2;
  const openTasks: number = 1;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color={C.accent} /> ממשל סיכונים
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            מדיניות · ממשל · מנהל סיכונים · פיקוח דירקטוריון
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ScoreRing score={78} size={80} label="שלמות ממשל" />
          <div style={{ background: complianceScore >= 70 ? C.successBg : C.warningBg, color: complianceScore >= 70 ? C.success : C.warning, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 8, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckSquare size={14} /> {complianceScore}% עמידה
          </div>
        </div>
      </div>

      {/* ═══ Reg Badges ═══ */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BookOpen size={12} /> חוזר 2024-10-2 · §2(א) · GOV-01
        </div>
        <div style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BookOpen size={12} /> §2(ב) · GOV-05
        </div>
      </div>

      {/* ═══ KPI Row ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'ציון עמידה', value: `${complianceScore}%`, c: complianceScore >= 70 ? C.success : C.warning },
          { label: 'דרישות', value: `${requirementsMet}/${requirementsTotal}`, c: requirementsMet >= requirementsTotal - 2 ? C.success : C.warning },
          { label: 'מדיניות פעילות', value: activePolicies, c: C.accent },
          { label: 'משימות פתוחות', value: openTasks, c: openTasks === 0 ? C.success : C.warning },
        ].map((kpi, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: kpi.c, fontFamily: 'var(--font-rubik)' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ═══ NuTeLa Alert ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(123,97,255,0.06), rgba(0,212,255,0.06))',
        border: '1px solid rgba(123,97,255,0.15)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #7B61FF, #BD34FE)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>
          🥚
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
            מדיניות הסיכונים תפוג בעוד 30 יום
          </span>
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)', display: 'block' }}>
            NuTeLa · יש לעדכן את מדיניות ניהול הסיכונים לפני תום התוקף
          </span>
        </div>
      </div>

      {/* ═══ Main Content Grid ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ═══ Policy Manager Card ═══ */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color={C.accent} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0 }}>ניהול מדיניות</h2>
          </div>

          {policies.map(policy => {
            const st = POLICY_STATUS[policy.status];
            const isExpanded = expandedPolicy === policy.id;

            return (
              <div key={policy.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                {/* Policy Header */}
                <div
                  onClick={() => setExpandedPolicy(isExpanded ? null : policy.id)}
                  style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: isExpanded ? C.accentLight : 'transparent', transition: 'background 0.1s' }}
                >
                  {isExpanded ? <ChevronDown size={14} color={C.accent} /> : <ChevronRight size={14} color={C.textMuted} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 3 }}>{policy.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ background: st.bg, color: st.c, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>{st.l}</span>
                      <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-rubik)' }}>v{policy.version}</span>
                    </div>
                  </div>
                </div>

                {/* Policy Details */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 14px' }}>
                    {/* Meta grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{ background: C.borderLight, borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 3 }}>אישור דירקטוריון</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{policy.boardApproval}</div>
                      </div>
                      <div style={{ background: C.borderLight, borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: 'var(--font-assistant)', marginBottom: 3 }}>תוקף עד</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{policy.expiry}</div>
                      </div>
                    </div>

                    {/* Version History Table */}
                    {policy.history.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)', marginBottom: 8 }}>היסטוריית גרסאות</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-assistant)' }}>
                          <thead>
                            <tr style={{ background: C.borderLight, borderBottom: `1px solid ${C.border}` }}>
                              {['גרסה', 'תאריך', 'הערה', 'מעדכן'].map(h => (
                                <th key={h} style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 600, fontSize: 10, color: C.textSec, fontFamily: 'var(--font-rubik)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {policy.history.map((entry, i) => (
                              <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}`, background: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
                                <td style={{ padding: '7px 10px', fontWeight: 600, color: C.accent, fontFamily: 'var(--font-rubik)' }}>{entry.version}</td>
                                <td style={{ padding: '7px 10px', color: C.textSec }}>{entry.date}</td>
                                <td style={{ padding: '7px 10px', color: C.text }}>{entry.note}</td>
                                <td style={{ padding: '7px 10px', color: C.textMuted }}>{entry.author}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ Risk Officer Profile Card ═══ */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} color={C.accent} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: 0 }}>פרופיל מנהל סיכונים</h2>
          </div>

          <div style={{ padding: '18px' }}>
            {/* Name & Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} color={C.accent} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>{officer.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{officer.role}</div>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: C.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={13} color={C.textMuted} />
                </div>
                <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)', direction: 'ltr', unicodeBidi: 'embed' }}>{officer.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: C.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={13} color={C.textMuted} />
                </div>
                <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)', direction: 'ltr', unicodeBidi: 'embed' }}>{officer.email}</span>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Appointment Letter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.borderLight, borderRadius: 8, padding: '10px 14px' }}>
                <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>כתב מינוי</span>
                <span style={{ background: C.successBg, color: C.success, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)' }}>הועלה</span>
              </div>

              {/* Reporting Line */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.borderLight, borderRadius: 8, padding: '10px 14px' }}>
                <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>קו דיווח</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>{officer.reportingTo}</span>
              </div>

              {/* Certifications */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.borderLight, borderRadius: 8, padding: '10px 14px' }}>
                <span style={{ fontSize: 12, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>הסמכות</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {officer.certifications.map(cert => (
                    <span key={cert} style={{ background: C.accentLight, color: C.accent, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Award size={10} /> {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
