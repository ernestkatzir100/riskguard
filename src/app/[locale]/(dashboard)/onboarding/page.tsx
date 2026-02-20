'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, Building2, CreditCard, ClipboardCheck, UserCog,
  Users, Mail, Rocket, CheckCircle2, ChevronLeft, ChevronRight,
  Plus, X, Phone, AtSign, User,
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   V11 color palette
   ═══════════════════════════════════════════════ */
const C = {
  accent: '#4A8EC2',
  accentTeal: '#5BB8C9',
  accentLight: '#E8F4FA',
  success: '#2E8B57',
  successBg: '#EFF8F2',
  warning: '#C8922A',
  warningBg: '#FDF8ED',
  danger: '#C0392B',
  dangerBg: '#FDF0EE',
  surface: '#FFFFFF',
  text: '#1A2332',
  textSec: '#4A5568',
  textMuted: '#8896A6',
  border: '#E1E8EF',
  borderLight: '#F0F3F7',
} as const;

const TOTAL_STEPS = 7;

/* ═══════════════════════════════════════════════
   Step metadata
   ═══════════════════════════════════════════════ */
const STEP_META: { title: string; subtitle: string }[] = [
  { title: 'פרטי החברה', subtitle: 'הזינו את שם החברה והעלו לוגו' },
  { title: 'סוג רישיון', subtitle: 'בחרו את סוג הרישיון שלכם' },
  { title: 'הערכת ציות מהירה', subtitle: 'ענו על מספר שאלות כדי להבין את מצב הציות' },
  { title: 'קצין ציות / מנהל סיכונים', subtitle: 'הזינו את פרטי קצין הציות או מנהל הסיכונים' },
  { title: 'חברי דירקטוריון', subtitle: 'הוסיפו את חברי הדירקטוריון של החברה' },
  { title: 'הזמנת צוות', subtitle: 'הזמינו חברי צוות נוספים לפלטפורמה' },
  { title: 'סיכום והפעלה', subtitle: 'הכל מוכן! בדקו את הפרטים והתחילו לעבוד' },
];

/* ═══════════════════════════════════════════════
   Compliance questions for Step 2
   ═══════════════════════════════════════════════ */
const COMPLIANCE_QUESTIONS = [
  'יש לכם מדיניות ניהול סיכונים?',
  'יש לכם תוכנית המשכיות עסקית?',
  'יש לכם מדיניות סייבר?',
  'האם בוצע מיפוי סיכונים בשנה האחרונה?',
  'האם מונה קצין ציות / מנהל סיכונים?',
];

/* ═══════════════════════════════════════════════
   License options for Step 1
   ═══════════════════════════════════════════════ */
const LICENSE_OPTIONS = [
  { id: 'extended', label: 'רישיון אשראי מורחב', desc: 'נותני אשראי בהיקף רחב עם חובות רגולטוריות מלאות' },
  { id: 'basic', label: 'רישיון אשראי בסיסי', desc: 'נותני אשראי בהיקף מצומצם עם חובות רגולטוריות בסיסיות' },
  { id: 'other', label: 'אחר', desc: 'סוג רישיון אחר או בתהליך קבלת רישיון' },
];

/* ═══════════════════════════════════════════════
   Shared styles
   ═══════════════════════════════════════════════ */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'var(--font-assistant)',
  color: C.text,
  outline: 'none',
  background: C.surface,
  direction: 'rtl',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: C.text,
  fontFamily: 'var(--font-rubik)',
  marginBottom: 6,
  display: 'block',
};

const primaryBtnStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.accent}, ${C.accentTeal})`,
  color: 'white',
  border: 'none',
  padding: '10px 28px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-rubik)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: C.textSec,
  border: `1px solid ${C.border}`,
  padding: '10px 20px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--font-rubik)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

/* ═══════════════════════════════════════════════
   Progress Dots
   ═══════════════════════════════════════════════ */
function ProgressDots({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        let bg: string = C.borderLight;
        if (i < current) bg = C.success;
        if (i === current) bg = C.accent;
        return (
          <div
            key={i}
            style={{
              width: i === current ? 28 : 10,
              height: 10,
              borderRadius: 5,
              background: bg,
              transition: 'all 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Onboarding Page
   ═══════════════════════════════════════════════ */
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 0 state
  const [companyName, setCompanyName] = useState('');
  const [logoFile, setLogoFile] = useState<string | null>(null);

  // Step 1 state
  const [licenseType, setLicenseType] = useState<string | null>(null);

  // Step 2 state
  const [complianceAnswers, setComplianceAnswers] = useState<Record<number, boolean | null>>({});

  // Step 3 state
  const [officerName, setOfficerName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');

  // Step 4 state
  const [boardMembers, setBoardMembers] = useState<{ name: string; role: string }[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Step 5 state
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const meta = STEP_META[currentStep];

  function handleNext() {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  function handleSkip() {
    handleNext();
  }

  function handleLaunch() {
    router.push('/he');
  }

  function addBoardMember() {
    if (newMemberName.trim()) {
      setBoardMembers((prev) => [...prev, { name: newMemberName.trim(), role: newMemberRole.trim() || 'חבר דירקטוריון' }]);
      setNewMemberName('');
      setNewMemberRole('');
    }
  }

  function removeBoardMember(index: number) {
    setBoardMembers((prev) => prev.filter((_, i) => i !== index));
  }

  function addInviteEmail() {
    if (newEmail.trim() && newEmail.includes('@')) {
      setInvitedEmails((prev) => [...prev, newEmail.trim()]);
      setNewEmail('');
    }
  }

  function removeInviteEmail(index: number) {
    setInvitedEmails((prev) => prev.filter((_, i) => i !== index));
  }

  /* ─── Step renderers ─── */

  function renderStep0() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>שם החברה</label>
          <div style={{ position: 'relative' }}>
            <Building2
              size={16}
              color={C.textMuted}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="לדוגמה: אשראי פייננס בע״מ"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ ...inputStyle, paddingRight: 38 }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>לוגו החברה</label>
          <div
            style={{
              border: `2px dashed ${C.border}`,
              borderRadius: 12,
              padding: '32px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              background: C.borderLight,
              transition: 'border-color 0.2s',
            }}
            onClick={() => setLogoFile('logo-placeholder.png')}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: C.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={22} color={C.accent} />
            </div>
            <span style={{ fontSize: 13, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
              {logoFile ? 'קובץ נבחר: ' + logoFile : 'לחצו להעלאת לוגו'}
            </span>
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
              PNG, JPG, SVG — עד 2MB
            </span>
          </div>
        </div>
      </div>
    );
  }

  function renderStep1() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LICENSE_OPTIONS.map((opt) => {
          const selected = licenseType === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setLicenseType(opt.id)}
              style={{
                border: `2px solid ${selected ? C.accent : C.border}`,
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                background: selected ? C.accentLight : C.surface,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? C.accent : C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {selected && (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: C.accent,
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                  {opt.desc}
                </div>
              </div>
              <CreditCard size={18} color={selected ? C.accent : C.textMuted} />
            </div>
          );
        })}
      </div>
    );
  }

  function renderStep2() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {COMPLIANCE_QUESTIONS.map((q, i) => {
          const answer = complianceAnswers[i];
          return (
            <div
              key={i}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <ClipboardCheck size={16} color={C.accent} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.text, fontFamily: 'var(--font-assistant)' }}>{q}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() =>
                    setComplianceAnswers((prev) => ({ ...prev, [i]: true }))
                  }
                  style={{
                    padding: '5px 16px',
                    borderRadius: 6,
                    border: `1px solid ${answer === true ? C.success : C.border}`,
                    background: answer === true ? C.successBg : C.surface,
                    color: answer === true ? C.success : C.textSec,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-rubik)',
                  }}
                >
                  כן
                </button>
                <button
                  onClick={() =>
                    setComplianceAnswers((prev) => ({ ...prev, [i]: false }))
                  }
                  style={{
                    padding: '5px 16px',
                    borderRadius: 6,
                    border: `1px solid ${answer === false ? C.danger : C.border}`,
                    background: answer === false ? C.dangerBg : C.surface,
                    color: answer === false ? C.danger : C.textSec,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-rubik)',
                  }}
                >
                  לא
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderStep3() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>שם מלא</label>
          <div style={{ position: 'relative' }}>
            <User
              size={16}
              color={C.textMuted}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="שם מלא"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              style={{ ...inputStyle, paddingRight: 38 }}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>טלפון</label>
          <div style={{ position: 'relative' }}>
            <Phone
              size={16}
              color={C.textMuted}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="tel"
              placeholder="050-0000000"
              value={officerPhone}
              onChange={(e) => setOfficerPhone(e.target.value)}
              style={{ ...inputStyle, paddingRight: 38 }}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>דוא״ל</label>
          <div style={{ position: 'relative' }}>
            <AtSign
              size={16}
              color={C.textMuted}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="email"
              placeholder="email@company.com"
              value={officerEmail}
              onChange={(e) => setOfficerEmail(e.target.value)}
              style={{ ...inputStyle, paddingRight: 38 }}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Add member form */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 18,
            background: C.borderLight,
          }}
        >
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: 12 }}>שם חבר הדירקטוריון</label>
              <input
                type="text"
                placeholder="שם מלא"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                style={inputStyle}
                onKeyDown={(e) => e.key === 'Enter' && addBoardMember()}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: 12 }}>תפקיד</label>
              <input
                type="text"
                placeholder='יו״ר / חבר דירקטוריון'
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                style={inputStyle}
                onKeyDown={(e) => e.key === 'Enter' && addBoardMember()}
              />
            </div>
          </div>
          <button
            onClick={addBoardMember}
            style={{
              ...primaryBtnStyle,
              padding: '8px 20px',
              fontSize: 13,
              width: 'auto',
            }}
          >
            <Plus size={14} />
            הוסף חבר
          </button>
        </div>

        {/* Members list */}
        {boardMembers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
              {boardMembers.length} חברים נוספו
            </span>
            {boardMembers.map((m, i) => (
              <div
                key={i}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: C.surface,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: C.accentLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={15} color={C.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                      {m.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeBoardMember(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} color={C.textMuted} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderStep5() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Email input */}
        <div>
          <label style={labelStyle}>כתובת דוא״ל</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Mail
                size={16}
                color={C.textMuted}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ ...inputStyle, paddingRight: 38 }}
                onKeyDown={(e) => e.key === 'Enter' && addInviteEmail()}
              />
            </div>
            <button
              onClick={addInviteEmail}
              style={{
                ...primaryBtnStyle,
                padding: '10px 20px',
                fontSize: 13,
              }}
            >
              הוסף
            </button>
          </div>
        </div>

        {/* Invited list */}
        {invitedEmails.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
              {invitedEmails.length} הזמנות
            </span>
            {invitedEmails.map((email, i) => (
              <div
                key={i}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: C.surface,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: C.accentLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mail size={14} color={C.accent} />
                  </div>
                  <span style={{ fontSize: 13, color: C.text, fontFamily: 'var(--font-assistant)' }}>
                    {email}
                  </span>
                </div>
                <button
                  onClick={() => removeInviteEmail(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} color={C.textMuted} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderStep6() {
    const yesCount = Object.values(complianceAnswers).filter((v) => v === true).length;
    const answeredCount = Object.values(complianceAnswers).filter((v) => v !== null && v !== undefined).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: C.successBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={38} color={C.success} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 6px' }}>
            המערכת מוכנה!
          </h2>
          <p style={{ fontSize: 14, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            סיימתם את תהליך ההקמה. הנה סיכום הפרטים שהזנתם:
          </p>
        </div>

        {/* Summary */}
        <div
          style={{
            width: '100%',
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {/* Company */}
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>שם החברה</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
              {companyName || '—'}
            </span>
          </div>

          {/* License */}
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>סוג רישיון</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
              {licenseType ? LICENSE_OPTIONS.find((o) => o.id === licenseType)?.label : '—'}
            </span>
          </div>

          {/* Compliance */}
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardCheck size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>הערכת ציות</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: yesCount >= 3 ? C.success : C.warning, fontFamily: 'var(--font-rubik)' }}>
              {answeredCount > 0 ? `${yesCount}/${answeredCount} חיובי` : '—'}
            </span>
          </div>

          {/* Officer */}
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCog size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>קצין ציות</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
              {officerName || '—'}
            </span>
          </div>

          {/* Board */}
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>חברי דירקטוריון</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
              {boardMembers.length > 0 ? `${boardMembers.length} חברים` : '—'}
            </span>
          </div>

          {/* Team invites */}
          <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={14} color={C.accent} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>הזמנות צוות</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
              {invitedEmails.length > 0 ? `${invitedEmails.length} הזמנות` : '—'}
            </span>
          </div>
        </div>

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          style={{
            ...primaryBtnStyle,
            padding: '14px 40px',
            fontSize: 16,
            borderRadius: 12,
            marginTop: 4,
          }}
        >
          <Rocket size={18} />
          התחל לעבוד
        </button>
      </div>
    );
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F7FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        direction: 'rtl',
        fontFamily: 'var(--font-assistant)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Progress dots */}
        <ProgressDots current={currentStep} />

        {/* White card */}
        <div
          style={{
            background: C.surface,
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: `1px solid ${C.border}`,
          }}
        >
          {/* Step header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  background: C.accentLight,
                  color: C.accent,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-rubik)',
                }}
              >
                {currentStep + 1} / {TOTAL_STEPS}
              </span>
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.text,
                fontFamily: 'var(--font-rubik)',
                margin: '0 0 4px',
              }}
            >
              {meta.title}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: C.textMuted,
                fontFamily: 'var(--font-assistant)',
                margin: 0,
              }}
            >
              {meta.subtitle}
            </p>
          </div>

          {/* Step content */}
          <div style={{ marginBottom: 28 }}>{stepRenderers[currentStep]()}</div>

          {/* Footer buttons */}
          {currentStep < TOTAL_STEPS - 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: `1px solid ${C.borderLight}`,
                paddingTop: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {currentStep > 0 && (
                  <button onClick={handleBack} style={secondaryBtnStyle}>
                    <ChevronRight size={15} />
                    חזור
                  </button>
                )}
                {currentStep >= 1 && currentStep <= 5 && (
                  <button
                    onClick={handleSkip}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: C.textMuted,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-rubik)',
                      padding: '8px 4px',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                  >
                    דלג
                  </button>
                )}
              </div>

              <button onClick={handleNext} style={primaryBtnStyle}>
                הבא
                <ChevronLeft size={15} />
              </button>
            </div>
          )}

          {/* Back button on summary step */}
          {currentStep === TOTAL_STEPS - 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                borderTop: `1px solid ${C.borderLight}`,
                paddingTop: 20,
              }}
            >
              <button onClick={handleBack} style={secondaryBtnStyle}>
                <ChevronRight size={15} />
                חזור
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
