'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Plus, Clock, AlertTriangle, CheckCircle, Loader2, Pencil, Trash2 } from 'lucide-react';
import { C } from '@/shared/lib/design-tokens';
import { FormModal } from '@/shared/components/form-modal';
import { TaskForm } from '@/shared/components/forms/task-form';
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus, completeTask } from '@/app/actions/tasks';
import { PageSkeleton } from '@/shared/components/skeleton-loader';
import { EmptyState, EMPTY_STATES } from '@/shared/components/empty-state';
import { ImportButton } from '@/shared/components/import-button';
import { importTasks } from '@/app/actions/import';

/* ═══ Types ═══ */
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
type TaskPriority = 'high' | 'medium' | 'low';

type Task = {
  id: string;
  title: string;
  module: string;
  dueDate: string;
  status: TaskStatus;
  assignedTo: string;
  priority: TaskPriority;
  description?: string;
  dueDateRaw?: string;
};

/* ═══ Demo Data ═══ */
const DEMO_TASKS: Task[] = [
  {
    id: 'TSK-001',
    title: 'עדכון מדיניות ממשל תאגידי',
    module: 'governance',
    dueDate: '2026-03-15',
    status: 'pending',
    assignedTo: 'יוסי כהן',
    priority: 'high',
  },
  {
    id: 'TSK-002',
    title: 'ביצוע סקר סיכוני סייבר רבעוני',
    module: 'cyber_governance',
    dueDate: '2026-02-28',
    status: 'in_progress',
    assignedTo: 'דנה לוי',
    priority: 'high',
  },
  {
    id: 'TSK-003',
    title: 'בדיקת תוכנית המשכיות עסקית',
    module: 'bcp',
    dueDate: '2026-02-10',
    status: 'overdue',
    assignedTo: 'מיכל אברהם',
    priority: 'high',
  },
  {
    id: 'TSK-004',
    title: 'סקירת הסכם ספק מיקור חוץ',
    module: 'outsourcing',
    dueDate: '2026-04-01',
    status: 'pending',
    assignedTo: 'רועי שמש',
    priority: 'medium',
  },
  {
    id: 'TSK-005',
    title: 'הכנת דוח סיכון תפעולי חודשי',
    module: 'operational',
    dueDate: '2026-02-20',
    status: 'completed',
    assignedTo: 'שרה ברק',
    priority: 'medium',
  },
  {
    id: 'TSK-006',
    title: 'עדכון נהלי הגנת סייבר',
    module: 'cyber_protection',
    dueDate: '2026-03-20',
    status: 'pending',
    assignedTo: 'אורי דוד',
    priority: 'medium',
  },
  {
    id: 'TSK-007',
    title: 'הכנת חומרים לדירקטוריון',
    module: 'board',
    dueDate: '2026-03-01',
    status: 'in_progress',
    assignedTo: 'נועה כהן',
    priority: 'low',
  },
  {
    id: 'TSK-008',
    title: 'תרגיל אירועי סייבר שנתי',
    module: 'cyber_incidents',
    dueDate: '2026-01-30',
    status: 'overdue',
    assignedTo: 'גלית לב',
    priority: 'high',
  },
];

/* ═══ Labels & Colors ═══ */
const STATUS_MAP: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'ממתין', color: C.warning, bg: C.warningBg },
  in_progress: { label: 'בתהליך', color: C.accent, bg: C.accentLight },
  completed: { label: 'הושלם', color: C.success, bg: C.successBg },
  overdue: { label: 'באיחור', color: C.danger, bg: C.dangerBg },
};

const PRIORITY_MAP: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: 'גבוהה', color: C.danger },
  medium: { label: 'בינונית', color: C.warning },
  low: { label: 'נמוכה', color: C.success },
};

const MODULE_MAP: Record<string, string> = {
  governance: 'ממשל תאגידי',
  operational: 'סיכון תפעולי',
  outsourcing: 'מיקור חוץ',
  bcp: 'המשכיות עסקית',
  cyber_governance: 'ממשל סייבר',
  cyber_protection: 'הגנת סייבר',
  cyber_incidents: 'אירועי סייבר',
  credit: 'סיכון אשראי',
  board: 'דירקטוריון',
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'pending', label: 'ממתין' },
  { value: 'in_progress', label: 'בתהליך' },
  { value: 'completed', label: 'הושלם' },
  { value: 'overdue', label: 'באיחור' },
];

const MODULE_FILTERS = [
  { value: 'all', label: 'כל המודולים' },
  ...Object.entries(MODULE_MAP).map(([value, label]) => ({ value, label })),
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const loadData = useCallback(async () => {
    try {
      const result = await getTasks();
      if (result && result.length > 0) {
        const mapped: Task[] = result.map((t: Record<string, unknown>) => ({
          id: String(t.id ?? ''),
          title: String(t.title ?? ''),
          module: String(t.module ?? 'governance'),
          dueDate: t.dueDate ? new Date(t.dueDate as string).toLocaleDateString('he-IL') : '—',
          dueDateRaw: t.dueDate ? new Date(t.dueDate as string).toISOString().split('T')[0] : '',
          status: String(t.status ?? 'pending') as TaskStatus,
          assignedTo: String(t.assignedTo ?? 'לא שויך'),
          priority: String(t.priority ?? 'medium') as TaskPriority,
          description: String(t.description ?? ''),
        }));
        setTasks(mapped);
      }
    } catch {
      /* fallback to demo */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Filtering */
  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (moduleFilter !== 'all' && t.module !== moduleFilter) return false;
    return true;
  });

  /* Stats */
  const totalCount = tasks.length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  /* Actions */
  async function handleCreateTask(data: Record<string, unknown>) {
    setFormLoading(true);
    try {
      await createTask(data);
      setShowForm(false);
      await loadData();
      showToast('המשימה נוצרה בהצלחה');
    } catch {
      showToast('שגיאה ביצירת המשימה', 'error');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleCompleteTask(id: string) {
    try {
      await completeTask(id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' as TaskStatus } : t));
    } catch {
      /* fallback: update locally */
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' as TaskStatus } : t));
    }
  }

  async function handleStatusChange(id: string, newStatus: TaskStatus) {
    try {
      await updateTaskStatus(id, newStatus);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const prev = [...tasks];
    setTasks(t => t.filter(x => x.id !== deleteTarget.id));
    setDeleteTarget(null);
    try {
      await deleteTask(deleteTarget.id);
      showToast('המשימה נמחקה בהצלחה');
    } catch {
      setTasks(prev);
      showToast('שגיאה במחיקת המשימה', 'error');
    }
  }

  if (loading) return <PageSkeleton />;
  if (tasks.length === 0) return <EmptyState {...EMPTY_STATES['tasks']} />;

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-assistant)', color: C.text, padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: C.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckSquare size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-rubik)', fontSize: 28, fontWeight: 700, margin: 0, color: C.text }}>
              משימות
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
              ניהול ומעקב אחר משימות ציות ובקרה
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', background: C.accent, color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-rubik)',
            }}
          >
            <Plus size={16} />
            הוסף משימה
          </button>
          <ImportButton importAction={importTasks} label="ייבוא משימות" />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'סה״כ משימות', value: totalCount, color: C.accent, icon: CheckSquare },
          { label: 'באיחור', value: overdueCount, color: C.danger, icon: AlertTriangle },
          { label: 'הושלמו', value: completedCount, color: C.success, icon: CheckCircle },
          { label: 'בתהליך', value: inProgressCount, color: C.warning, icon: Clock },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'var(--font-assistant)' }}>{stat.label}</span>
              <stat.icon size={16} color={stat.color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-rubik)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        {/* Status filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: statusFilter === f.value ? 600 : 400,
                cursor: 'pointer', fontFamily: 'var(--font-rubik)', transition: 'all 0.15s',
                background: statusFilter === f.value ? C.accent : C.surface,
                color: statusFilter === f.value ? '#fff' : C.textSec,
                border: `1px solid ${statusFilter === f.value ? C.accent : C.border}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Module filter */}
        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          style={{
            padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
            fontSize: 12, fontFamily: 'var(--font-rubik)', background: C.surface,
            color: C.textSec, cursor: 'pointer', outline: 'none',
          }}
        >
          {MODULE_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: 60, color: C.textMuted, fontSize: 14,
        }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>טוען משימות...</span>
        </div>
      ) : (
        /* Task Table */
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-assistant)' }}>
              <thead>
                <tr style={{ background: C.borderLight, borderBottom: `2px solid ${C.border}` }}>
                  {['#', 'משימה', 'מודול', 'אחראי', 'תאריך יעד', 'עדיפות', 'סטטוס', 'פעולות'].map(h => (
                    <th key={h} style={{
                      textAlign: h === 'פעולות' ? 'center' : 'right',
                      padding: '10px 12px', fontWeight: 600, fontSize: 11,
                      color: C.textSec, fontFamily: 'var(--font-rubik)', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{
                      padding: 40, textAlign: 'center', color: C.textMuted, fontSize: 14,
                    }}>
                      לא נמצאו משימות התואמות את הסינון
                    </td>
                  </tr>
                ) : (
                  filtered.map((task, i) => {
                    const statusInfo = STATUS_MAP[task.status];
                    const priorityInfo = PRIORITY_MAP[task.priority];
                    return (
                      <tr key={task.id} style={{
                        borderBottom: `1px solid ${C.borderLight}`,
                        background: i % 2 === 0 ? '#fff' : '#FAFBFC',
                        transition: 'background 0.1s',
                      }}>
                        {/* # */}
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-rubik)', fontWeight: 600, color: C.accent, fontSize: 12 }}>
                          {task.id}
                        </td>
                        {/* Title */}
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: C.text }}>
                          {task.title}
                        </td>
                        {/* Module */}
                        <td style={{ padding: '10px 12px', color: C.textSec, fontSize: 12 }}>
                          <span style={{
                            background: C.accentLight, color: C.accent, fontSize: 10, fontWeight: 600,
                            padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-rubik)',
                          }}>
                            {MODULE_MAP[task.module] || task.module}
                          </span>
                        </td>
                        {/* Assigned To */}
                        <td style={{ padding: '10px 12px', color: C.textSec, fontSize: 12 }}>
                          {task.assignedTo}
                        </td>
                        {/* Due Date */}
                        <td style={{ padding: '10px 12px', fontSize: 12, fontFamily: 'var(--font-rubik)', color: C.textSec }}>
                          {task.dueDate}
                        </td>
                        {/* Priority */}
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                            fontFamily: 'var(--font-rubik)',
                            color: priorityInfo.color,
                            background: `${priorityInfo.color}14`,
                          }}>
                            {priorityInfo.label}
                          </span>
                        </td>
                        {/* Status */}
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                            fontFamily: 'var(--font-rubik)',
                            color: statusInfo.color,
                            background: statusInfo.bg,
                          }}>
                            {statusInfo.label}
                          </span>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                title="סמן כהושלם"
                                style={{
                                  background: C.successBg, border: `1px solid ${C.success}33`,
                                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                                  fontSize: 10, fontWeight: 600, color: C.success,
                                  fontFamily: 'var(--font-rubik)',
                                }}
                              >
                                השלם
                              </button>
                            )}
                            {task.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(task.id, 'in_progress')}
                                title="התחל עבודה"
                                style={{
                                  background: C.accentLight, border: `1px solid ${C.accent}33`,
                                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                                  fontSize: 10, fontWeight: 600, color: C.accent,
                                  fontFamily: 'var(--font-rubik)',
                                }}
                              >
                                התחל
                              </button>
                            )}
                            {task.status === 'overdue' && (
                              <button
                                onClick={() => handleStatusChange(task.id, 'in_progress')}
                                title="החזר לטיפול"
                                style={{
                                  background: C.warningBg, border: `1px solid ${C.warning}33`,
                                  borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                                  fontSize: 10, fontWeight: 600, color: C.warning,
                                  fontFamily: 'var(--font-rubik)',
                                }}
                              >
                                טפל
                              </button>
                            )}
                            <button
                              onClick={() => setEditTask(task)}
                              title="ערוך"
                              style={{
                                background: 'none', border: `1px solid ${C.border}`,
                                borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
                              }}
                            >
                              <Pencil size={12} color={C.textSec} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(task)}
                              title="מחק"
                              style={{
                                background: 'none', border: `1px solid ${C.border}`,
                                borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} color={C.danger} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="הוספת משימה חדשה"
        onSubmit={() => {}}
        loading={formLoading}
        submitLabel="הוסף משימה"
        hideFooter
      >
        <TaskForm
          mode="create"
          onSubmit={async (data) => {
            await handleCreateTask(data);
          }}
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* Edit Task Modal */}
      <FormModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        title="עריכת משימה"
        onSubmit={() => {}}
        hideFooter
      >
        {editTask && (
          <TaskForm
            mode="edit"
            initialData={{
              title: editTask.title,
              description: editTask.description ?? '',
              module: editTask.module,
              priority: editTask.priority,
              dueDate: editTask.dueDateRaw ?? '',
              assignedTo: editTask.assignedTo === 'לא שויך' ? '' : editTask.assignedTo,
            }}
            onSubmit={async (data) => {
              try {
                await updateTask(editTask.id, data);
                setEditTask(null);
                await loadData();
                showToast('המשימה עודכנה בהצלחה');
              } catch {
                showToast('שגיאה בעדכון המשימה', 'error');
              }
            }}
            onCancel={() => setEditTask(null)}
          />
        )}
      </FormModal>

      {/* Delete Confirmation */}
      <FormModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="מחיקת משימה"
        onSubmit={handleDelete}
        submitLabel="מחק"
      >
        <p style={{ fontSize: 14, color: C.text, fontFamily: 'var(--font-assistant)', margin: 0 }}>
          האם למחוק את המשימה <strong>&quot;{deleteTarget?.title}&quot;</strong>?
        </p>
        <p style={{ fontSize: 12, color: C.danger, fontFamily: 'var(--font-assistant)', marginTop: 8 }}>
          פעולה זו אינה הפיכה.
        </p>
      </FormModal>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? C.success : C.danger,
          color: 'white', padding: '10px 24px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-rubik)',
          zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {toast.message}
        </div>
      )}

      {/* Spin animation for loader */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
