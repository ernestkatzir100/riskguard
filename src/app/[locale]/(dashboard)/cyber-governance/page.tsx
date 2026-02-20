'use client';

import {
  Lock, BookOpen, ShieldCheck, Server, User, Phone, Mail,
  Award, Calendar, AlertTriangle, ClipboardList, Monitor,
  Cloud, Wifi, Globe, Cpu,
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   V11 exact color palette
   ═══════════════════════════════════════════════ */
const C = {
  accent: '#4A8EC2', accentTeal: '#5BB8C9',
  accentLight: '#E8F4FA',
  success: '#2E8B57', successBg: '#EFF8F2',
  warning: '#C8922A', warningBg: '#FDF8ED',
  danger: '#C0392B', dangerBg: '#FDF0EE',
  surface: '#FFFFFF', text: '#1A2332', textSec: '#4A5568', textMuted: '#8896A6',
  border: '#E1E8EF', borderLight: '#F0F3F7',
} as const;

/* ═══════════════════════════════════════════════
   Asset Register Data
   ═══════════════════════════════════════════════ */
type Asset = {
  name: string;
  type: string;
  owner: string;
  classification: string;
  criticality: 'קריטי' | 'גבוה' | 'בינוני';
};

const ASSETS: Asset[] = [
  { name: 'מערכת Core Banking', type: 'שרת', owner: 'IT', classification: 'סודי', criticality: 'קריטי' },
  { name: 'CRM', type: 'ענן', owner: 'מכירות', classification: 'רגיש', criticality: 'גבוה' },
  { name: 'דוא"ל ארגוני', type: 'SaaS', owner: 'IT', classification: 'רגיש', criticality: 'גבוה' },
  { name: 'מערכת גיבויים', type: 'שרת', owner: 'IT', classification: 'סודי', criticality: 'קריטי' },
  { name: 'Firewall', type: 'רשת', owner: 'IT', classification: 'פנימי', criticality: 'קריטי' },
  { name: 'VPN', type: 'רשת', owner: 'IT', classification: 'רגיש', criticality: 'גבוה' },
  { name: 'תחנות קצה - הנה"ח', type: 'PC', owner: 'כספים', classification: 'רגיש', criticality: 'בינוני' },
  { name: 'תחנות קצה - מכירות', type: 'PC', owner: 'מכירות', classification: 'רגיש', criticality: 'בינוני' },
  { name: 'תחנות קצה - שירות', type: 'PC', owner: 'שירות', classification: 'רגיש', criticality: 'בינוני' },
  { name: 'תחנות קצה - IT', type: 'PC', owner: 'IT', classification: 'רגיש', criticality: 'בינוני' },
];

const CRIT_STYLE: Record<string, { color: string; bg: string }> = {
  'קריטי': { color: C.danger, bg: C.dangerBg },
  'גבוה': { color: C.warning, bg: C.warningBg },
  'בינוני': { color: C.accent, bg: C.accentLight },
};

const TYPE_ICON: Record<string, typeof Server> = {
  'שרת': Server,
  'ענן': Cloud,
  'SaaS': Globe,
  'רשת': Wifi,
  'PC': Monitor,
};

/* ═══════════════════════════════════════════════
   Cyber Governance Page
   ═══════════════════════════════════════════════ */
export default function CyberGovernancePage() {
  return (
    <div style={{ direction: 'rtl' }}>
      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)', margin: '0 0 3px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Lock size={20} color={C.accent} /> ממשל סייבר
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)', margin: 0 }}>
            מדיניות סייבר · CISO · מרשם נכסים · הערכת סיכונים
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: '#EDE9FE', color: '#7C3AED',
            fontSize: 11, fontWeight: 600, padding: '5px 12px',
            borderRadius: 6, fontFamily: 'var(--font-rubik)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <BookOpen size={12} /> חוזר 2022-10-9 §3
          </div>
          <span style={{
            background: '#EDE9FE', color: '#7C3AED',
            fontSize: 9, fontWeight: 600, padding: '3px 8px',
            borderRadius: 4, fontFamily: 'var(--font-rubik)',
          }}>
            (2022-10-9, §3, CGV-01)
          </span>
          <span style={{
            background: '#EDE9FE', color: '#7C3AED',
            fontSize: 9, fontWeight: 600, padding: '3px 8px',
            borderRadius: 4, fontFamily: 'var(--font-rubik)',
          }}>
            (§4, CGV-03)
          </span>
        </div>
      </div>

      {/* ═══ KPI Row ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'ציון עמידה', value: '72%', c: C.warning },
          { label: 'דרישות', value: '8/11', c: C.accent },
          { label: 'נכסים ממופים', value: '10', c: C.success },
          { label: 'הערכת סיכון', value: 'Q3 2025', c: C.accentTeal },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '14px 16px', textAlign: 'center',
            borderTop: `3px solid ${kpi.c}`,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800, color: kpi.c,
              fontFamily: 'var(--font-rubik)',
            }}>
              {kpi.value}
            </div>
            <div style={{
              fontSize: 11, color: C.textMuted,
              fontFamily: 'var(--font-assistant)',
            }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Cyber Policy + CISO Profile ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* Cyber Policy Card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '16px 18px',
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)', margin: '0 0 14px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <ShieldCheck size={14} color={C.accent} /> מדיניות סייבר ארגונית
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{
              background: C.successBg, color: C.success,
              fontSize: 10, fontWeight: 600, padding: '3px 10px',
              borderRadius: 4, fontFamily: 'var(--font-rubik)',
            }}>
              מאושר
            </span>
          </div>

          {[
            { l: 'עדכון אחרון', v: 'אוגוסט 2025 (לפני 6 חודשים)' },
            { l: 'סקירה הבאה', v: 'פברואר 2026' },
            { l: 'אישור דירקטוריון', v: 'כן' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < 2 ? `1px solid ${C.borderLight}` : 'none',
            }}>
              <span style={{
                fontSize: 12, color: C.textMuted,
                fontFamily: 'var(--font-assistant)',
              }}>
                {item.l}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: C.text,
                fontFamily: 'var(--font-rubik)',
              }}>
                {item.v}
              </span>
            </div>
          ))}
        </div>

        {/* CISO Profile Card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '16px 18px',
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)', margin: '0 0 14px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <User size={14} color={C.accent} /> אחראי סייבר ארגוני (CISO)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4A8EC2, #5BB8C9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 15, fontWeight: 700,
              fontFamily: 'var(--font-rubik)',
            }}>
              אב
            </div>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: C.text,
                fontFamily: 'var(--font-rubik)',
              }}>
                אלון ברק
              </div>
              <div style={{
                fontSize: 11, color: C.textMuted,
                fontFamily: 'var(--font-assistant)',
              }}>
                אחראי סייבר ארגוני
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 6, alignItems: 'center',
            marginBottom: 12,
          }}>
            <span style={{
              background: C.successBg, color: C.success,
              fontSize: 10, fontWeight: 600, padding: '3px 10px',
              borderRadius: 4, fontFamily: 'var(--font-rubik)',
            }}>
              מונה רשמית
            </span>
          </div>

          <div style={{
            background: C.borderLight, borderRadius: 8,
            padding: 12, marginBottom: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 8,
            }}>
              <Phone size={12} color={C.textMuted} />
              <span style={{
                fontSize: 12, color: C.text,
                fontFamily: 'var(--font-rubik)',
                direction: 'ltr' as const,
              }}>
                050-9876543
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Mail size={12} color={C.textMuted} />
              <span style={{
                fontSize: 12, color: C.text,
                fontFamily: 'var(--font-rubik)',
                direction: 'ltr' as const,
              }}>
                alon@credit-finance.co.il
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={12} color={C.accent} />
            <span style={{
              fontSize: 11, color: C.textMuted,
              fontFamily: 'var(--font-assistant)',
            }}>
              הסמכות:
            </span>
            {['CISSP', 'CISM'].map(cert => (
              <span key={cert} style={{
                background: C.accentLight, color: C.accent,
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                borderRadius: 4, fontFamily: 'var(--font-rubik)',
              }}>
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Asset Register Table ═══ */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, overflow: 'hidden', marginBottom: 16,
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <ClipboardList size={14} color={C.accent} />
          <span style={{
            fontSize: 13, fontWeight: 700, color: C.text,
            fontFamily: 'var(--font-rubik)',
          }}>
            מרשם נכסי מידע ({ASSETS.length})
          </span>
        </div>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: 12, fontFamily: 'var(--font-assistant)',
        }}>
          <thead>
            <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
              {['#', 'שם', 'סוג', 'בעלים', 'סיווג מידע', 'קריטיות'].map(h => (
                <th key={h} style={{
                  textAlign: 'right', padding: '9px 10px',
                  fontWeight: 600, fontSize: 11, color: C.textSec,
                  fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((asset, i) => {
              const cs = CRIT_STYLE[asset.criticality];
              const IconComp = TYPE_ICON[asset.type] || Cpu;
              return (
                <tr key={i} style={{
                  borderBottom: `1px solid ${C.borderLight}`,
                  background: i % 2 === 0 ? 'white' : '#FAFBFC',
                }}>
                  <td style={{
                    padding: '10px', color: C.textMuted,
                    fontSize: 11, fontFamily: 'var(--font-rubik)',
                  }}>
                    {i + 1}
                  </td>
                  <td style={{
                    padding: '10px', fontWeight: 500, color: C.text,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconComp size={13} color={C.textMuted} />
                      {asset.name}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      background: C.borderLight, padding: '2px 7px',
                      borderRadius: 4, fontSize: 10, color: C.textSec,
                      fontFamily: 'var(--font-rubik)',
                    }}>
                      {asset.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: C.textSec }}>
                    {asset.owner}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      background: C.borderLight, padding: '2px 7px',
                      borderRadius: 4, fontSize: 10, color: C.textSec,
                      fontFamily: 'var(--font-rubik)',
                    }}>
                      {asset.classification}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      background: cs.bg, color: cs.color,
                      fontSize: 10, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 4,
                      fontFamily: 'var(--font-rubik)',
                    }}>
                      {asset.criticality}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ Annual Cyber Risk Assessment ═══ */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '16px 18px',
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: C.text,
          fontFamily: 'var(--font-rubik)', margin: '0 0 14px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <AlertTriangle size={14} color={C.warning} /> הערכת סיכוני סייבר שנתית
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div style={{
            background: C.borderLight, borderRadius: 10,
            padding: 14, textAlign: 'center',
          }}>
            <div style={{
              fontSize: 10, color: C.textMuted,
              fontFamily: 'var(--font-assistant)', marginBottom: 4,
            }}>
              הושלמה
            </div>
            <div style={{
              fontSize: 16, fontWeight: 800, color: C.success,
              fontFamily: 'var(--font-rubik)',
            }}>
              Q3 2025
            </div>
          </div>
          <div style={{
            background: C.borderLight, borderRadius: 10,
            padding: 14, textAlign: 'center',
          }}>
            <div style={{
              fontSize: 10, color: C.textMuted,
              fontFamily: 'var(--font-assistant)', marginBottom: 4,
            }}>
              ממצאים עיקריים
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'baseline' }}>
              <span style={{
                fontSize: 16, fontWeight: 800, color: C.danger,
                fontFamily: 'var(--font-rubik)',
              }}>
                3
              </span>
              <span style={{
                fontSize: 10, color: C.danger,
                fontFamily: 'var(--font-assistant)',
              }}>
                גבוהים
              </span>
              <span style={{
                fontSize: 16, fontWeight: 800, color: C.warning,
                fontFamily: 'var(--font-rubik)',
              }}>
                2
              </span>
              <span style={{
                fontSize: 10, color: C.warning,
                fontFamily: 'var(--font-assistant)',
              }}>
                בינוניים
              </span>
            </div>
          </div>
          <div style={{
            background: C.borderLight, borderRadius: 10,
            padding: 14, textAlign: 'center',
          }}>
            <div style={{
              fontSize: 10, color: C.textMuted,
              fontFamily: 'var(--font-assistant)', marginBottom: 4,
            }}>
              הערכה הבאה
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Calendar size={14} color={C.accent} />
              <span style={{
                fontSize: 16, fontWeight: 800, color: C.accent,
                fontFamily: 'var(--font-rubik)',
              }}>
                Q3 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
