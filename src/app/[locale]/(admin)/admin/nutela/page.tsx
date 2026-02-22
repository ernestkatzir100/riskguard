'use client';

import { useState, useEffect } from 'react';
import {
  Bot, Send, Sparkles, Clock, CheckCircle2, AlertTriangle,
  X, Plus, Building2, RefreshCw,
} from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import {
  getNutelaData, getTenantPushes, createPush,
  getTenantComplianceGaps, generateAITasks,
  type NutelaTenantSummary,
} from '@/app/actions/nutela';

type Push = Awaited<ReturnType<typeof getTenantPushes>>[number];
type AITask = { title: string; description: string; module: string };

const STATUS_STYLE: Record<string, { label: string; c: string; bg: string }> = {
  pending: { label: 'ממתין', c: C.warning, bg: C.warningBg },
  sent: { label: 'נשלח', c: C.accent, bg: C.accentLight },
  answered: { label: 'נענה', c: C.success, bg: C.successBg },
  overdue: { label: 'באיחור', c: C.danger, bg: C.dangerBg },
};

export default function NutelaConsolePage() {
  const [summaries, setSummaries] = useState<NutelaTenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [pushes, setPushes] = useState<Push[]>([]);
  const [pushLoading, setPushLoading] = useState(false);

  // New push form
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'task' | 'questionnaire'>('task');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSchedule, setFormSchedule] = useState<string>('');
  const [formSaving, setFormSaving] = useState(false);

  // AI generation
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);

  useEffect(() => {
    getNutelaData()
      .then(setSummaries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function selectTenant(tenantId: string) {
    setSelectedTenant(tenantId);
    setPushLoading(true);
    setShowForm(false);
    setShowAiPreview(false);
    try {
      const p = await getTenantPushes(tenantId);
      setPushes(p);
    } catch { /* silent */ }
    setPushLoading(false);
  }

  async function handleCreatePush() {
    if (!selectedTenant || !formTitle.trim()) return;
    setFormSaving(true);
    try {
      await createPush({
        tenantId: selectedTenant,
        type: formType,
        title: formTitle.trim(),
        description: formDesc.trim(),
        schedule: formSchedule || null,
        generatedBy: 'manual',
      });
      // Refresh
      const p = await getTenantPushes(selectedTenant);
      setPushes(p);
      setShowForm(false);
      setFormTitle('');
      setFormDesc('');
      setFormSchedule('');
      // Refresh summaries
      const s = await getNutelaData();
      setSummaries(s);
    } catch { /* silent */ }
    setFormSaving(false);
  }

  async function handleGenerateAI() {
    if (!selectedTenant) return;
    setAiLoading(true);
    try {
      const gaps = await getTenantComplianceGaps(selectedTenant);
      if (gaps.length === 0) {
        setAiTasks([]);
        setShowAiPreview(true);
        setAiLoading(false);
        return;
      }
      const tasks = await generateAITasks(selectedTenant, gaps);
      setAiTasks(tasks);
      setShowAiPreview(true);
    } catch { /* silent */ }
    setAiLoading(false);
  }

  async function pushAiTask(task: AITask) {
    if (!selectedTenant) return;
    await createPush({
      tenantId: selectedTenant,
      type: 'task',
      title: task.title,
      description: task.description,
      schedule: null,
      generatedBy: 'nutela_ai',
    });
    // Refresh pushes
    const p = await getTenantPushes(selectedTenant);
    setPushes(p);
    const s = await getNutelaData();
    setSummaries(s);
    // Remove from preview
    setAiTasks(prev => prev.filter(t => t.title !== task.title));
  }

  const selectedName = summaries.find(s => s.id === selectedTenant)?.name ?? '';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>טוען...</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={22} color={C.accentTeal} />
          קונסולת NuTeLa
        </h1>
        <p style={{ fontSize: 12, color: C.textMuted, margin: 0, fontFamily: 'var(--font-assistant)' }}>
          ניהול משימות ושאלונים ללקוחות
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Tenant list */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          overflow: 'hidden', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto',
        }}>
          <div style={{
            padding: '10px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`,
            fontSize: 11, fontWeight: 600, color: C.textMuted, fontFamily: 'var(--font-rubik)',
          }}>
            לקוחות ({summaries.length})
          </div>
          {summaries.map(s => (
            <div
              key={s.id}
              onClick={() => selectTenant(s.id)}
              style={{
                padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${C.borderLight}`,
                background: selectedTenant === s.id ? C.accentLight : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 4 }}>
                {s.name}
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10, fontFamily: 'var(--font-assistant)' }}>
                {s.pendingCount > 0 && (
                  <span style={{ color: C.warning, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Clock size={10} /> {s.pendingCount} ממתין
                  </span>
                )}
                {s.answeredCount > 0 && (
                  <span style={{ color: C.success, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle2 size={10} /> {s.answeredCount}
                  </span>
                )}
                {s.overdueCount > 0 && (
                  <span style={{ color: C.danger, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AlertTriangle size={10} /> {s.overdueCount}
                  </span>
                )}
                {s.pendingCount === 0 && s.answeredCount === 0 && s.overdueCount === 0 && (
                  <span style={{ color: C.textMuted }}>אין שליחות</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div>
          {!selectedTenant ? (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: 60, textAlign: 'center', color: C.textMuted, fontFamily: 'var(--font-assistant)',
            }}>
              <Bot size={40} color={C.borderLight} style={{ marginBottom: 12 }} />
              <div>בחר לקוח מהרשימה</div>
            </div>
          ) : (
            <>
              {/* Tenant header + actions */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '14px 18px', marginBottom: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={16} color={C.accent} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                    {selectedName}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setShowForm(true); setShowAiPreview(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                      background: C.accentGrad, color: 'white', border: 'none', borderRadius: 8,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-rubik)',
                    }}
                  >
                    <Plus size={13} /> שליחה ידנית
                  </button>
                  <button
                    onClick={handleGenerateAI}
                    disabled={aiLoading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                      background: aiLoading ? C.borderLight : 'linear-gradient(135deg, #7B61FF, #00D4FF)',
                      color: 'white', border: 'none', borderRadius: 8,
                      fontSize: 12, fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer',
                      fontFamily: 'var(--font-rubik)',
                    }}
                  >
                    {aiLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {aiLoading ? 'מייצר...' : 'ייצור משימות AI'}
                  </button>
                </div>
              </div>

              {/* New push form */}
              {showForm && (
                <div style={{
                  background: C.surface, border: `1px solid ${C.accent}`, borderRadius: 12,
                  padding: 18, marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      שליחה חדשה
                    </span>
                    <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <X size={14} color={C.textMuted} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={formType}
                        onChange={e => setFormType(e.target.value as 'task' | 'questionnaire')}
                        style={{
                          padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
                          fontSize: 12, fontFamily: 'var(--font-assistant)', background: 'white',
                          color: C.text, direction: 'rtl',
                        }}
                      >
                        <option value="task">משימה</option>
                        <option value="questionnaire">שאלון</option>
                      </select>
                      <select
                        value={formSchedule}
                        onChange={e => setFormSchedule(e.target.value)}
                        style={{
                          padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
                          fontSize: 12, fontFamily: 'var(--font-assistant)', background: 'white',
                          color: C.text, direction: 'rtl',
                        }}
                      >
                        <option value="">חד פעמי</option>
                        <option value="weekly">שבועי</option>
                        <option value="monthly">חודשי</option>
                      </select>
                    </div>
                    <input
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="כותרת..."
                      style={{
                        padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
                        fontSize: 13, fontFamily: 'var(--font-assistant)', direction: 'rtl',
                      }}
                    />
                    <textarea
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      placeholder="תיאור..."
                      rows={3}
                      style={{
                        padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
                        fontSize: 12, fontFamily: 'var(--font-assistant)', direction: 'rtl',
                        resize: 'vertical',
                      }}
                    />
                    <button
                      onClick={handleCreatePush}
                      disabled={!formTitle.trim() || formSaving}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px 0', background: formTitle.trim() ? C.accentGrad : C.borderLight,
                        color: 'white', border: 'none', borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: formTitle.trim() ? 'pointer' : 'not-allowed',
                        fontFamily: 'var(--font-rubik)',
                      }}
                    >
                      <Send size={13} />
                      {formSaving ? 'שולח...' : 'שלח ללקוח'}
                    </button>
                  </div>
                </div>
              )}

              {/* AI Preview */}
              {showAiPreview && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(123,97,255,0.05), rgba(0,212,255,0.05))',
                  border: '1px solid rgba(123,97,255,0.2)', borderRadius: 12,
                  padding: 18, marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Sparkles size={14} color="#7B61FF" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)' }}>
                      משימות שנוצרו על ידי AI
                    </span>
                    <button onClick={() => setShowAiPreview(false)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginRight: 'auto',
                    }}>
                      <X size={14} color={C.textMuted} />
                    </button>
                  </div>
                  {aiTasks.length === 0 ? (
                    <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>
                      לא נמצאו פערי ציות לייצור משימות
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {aiTasks.map((task, i) => (
                        <div key={i} style={{
                          background: 'white', border: `1px solid ${C.borderLight}`,
                          borderRadius: 8, padding: '10px 14px',
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'var(--font-rubik)', marginBottom: 2 }}>
                              {task.title}
                            </div>
                            <div style={{ fontSize: 11, color: C.textSec, fontFamily: 'var(--font-assistant)' }}>
                              {task.description}
                            </div>
                            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                              מודול: {task.module}
                            </div>
                          </div>
                          <button
                            onClick={() => pushAiTask(task)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', background: C.accentGrad,
                              color: 'white', border: 'none', borderRadius: 6,
                              fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap',
                            }}
                          >
                            <Send size={11} /> שלח
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Push history */}
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 18px', background: C.bg, borderBottom: `1px solid ${C.border}`,
                  fontSize: 12, fontWeight: 600, color: C.textSec, fontFamily: 'var(--font-rubik)',
                }}>
                  היסטוריית שליחות
                </div>
                {pushLoading ? (
                  <div style={{ padding: 30, textAlign: 'center', color: C.textMuted, fontSize: 12 }}>טוען...</div>
                ) : pushes.length === 0 ? (
                  <div style={{ padding: 30, textAlign: 'center', color: C.textMuted, fontSize: 12 }}>
                    אין שליחות ללקוח זה
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-assistant)' }}>
                    <thead>
                      <tr style={{ background: C.bg }}>
                        {['כותרת', 'סוג', 'תזמון', 'מקור', 'סטטוס', 'תאריך'].map((h, i) => (
                          <th key={i} style={{
                            padding: '8px 14px', textAlign: 'right', fontSize: 10, fontWeight: 600,
                            color: C.textMuted, fontFamily: 'var(--font-rubik)', borderBottom: `1px solid ${C.border}`,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pushes.map(p => {
                        const st = STATUS_STYLE[p.status] ?? STATUS_STYLE.pending;
                        return (
                          <tr key={p.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                            <td style={{ padding: '10px 14px', fontWeight: 500, color: C.text }}>{p.title}</td>
                            <td style={{ padding: '10px 14px', color: C.textSec }}>
                              {p.type === 'task' ? 'משימה' : 'שאלון'}
                            </td>
                            <td style={{ padding: '10px 14px', color: C.textSec }}>
                              {p.schedule === 'weekly' ? 'שבועי' : p.schedule === 'monthly' ? 'חודשי' : 'חד פעמי'}
                            </td>
                            <td style={{ padding: '10px 14px', color: C.textSec }}>
                              {p.generatedBy === 'nutela_ai' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Sparkles size={10} color="#7B61FF" /> AI
                                </span>
                              ) : 'ידני'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                background: st.bg, color: st.c, padding: '2px 8px',
                                borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-rubik)',
                              }}>
                                {st.label}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: 11, color: C.textMuted }}>
                              {new Date(p.createdAt).toLocaleDateString('he-IL')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
