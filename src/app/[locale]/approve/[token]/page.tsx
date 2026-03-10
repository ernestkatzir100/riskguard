'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, Calendar, Users } from 'lucide-react';
import { getApprovalByToken, respondToApproval } from '@/app/actions/board';

type ApprovalData = {
  id: string; meetingId: string; directorId: string;
  status: string; token: string; comment: string | null;
  respondedAt: string | null; directorName: string;
  meetingType: string; meetingDate: string;
};

export default function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
  const [data, setData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    params.then(p => {
      setToken(p.token);
      getApprovalByToken(p.token).then(r => {
        setData(r as ApprovalData | null);
        if (r && r.status !== 'pending') setDone(true);
        setLoading(false);
      }).catch(() => { setError('שגיאה בטעינת הנתונים'); setLoading(false); });
    });
  }, [params]);

  async function handleRespond(status: 'approved' | 'rejected') {
    setSubmitting(true);
    try {
      await respondToApproval(token, status, comment || undefined);
      setDone(true);
      setData(prev => prev ? { ...prev, status } : prev);
    } catch { setError('שגיאה בשליחת התשובה'); }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDF0F5' }}>
        <div style={{ textAlign: 'center', color: '#576B82', fontSize: 14 }}>טוען...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDF0F5', direction: 'rtl' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '40px 48px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: 440 }}>
          <XCircle size={48} color="#C81E1E" />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0B1120', marginTop: 16 }}>קישור לא תקין</h1>
          <p style={{ fontSize: 14, color: '#576B82', marginTop: 8 }}>{error || 'הקישור לא נמצא או שפג תוקפו.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDF0F5', direction: 'rtl', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '40px 48px', maxWidth: 520, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #1360A6, #0B8A99)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <FileText size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0B1120', margin: '0 0 4px' }}>אישור פרוטוקול</h1>
          <p style={{ fontSize: 13, color: '#576B82', margin: 0 }}>RiskGuard — ניהול דירקטוריון</p>
        </div>

        {/* Meeting Info */}
        <div style={{ background: '#EDF0F5', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Calendar size={14} color="#1360A6" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1120' }}>{data.meetingType}</span>
          </div>
          <div style={{ fontSize: 13, color: '#576B82' }}>
            {new Date(data.meetingDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, color: '#3B4A5E' }}>
            <Users size={14} color="#1360A6" />
            <span style={{ fontWeight: 600 }}>{data.directorName}</span>
          </div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {data.status === 'approved' ? (
              <>
                <CheckCircle2 size={48} color="#0D9440" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0D9440', marginTop: 12 }}>הפרוטוקול אושר</h2>
                <p style={{ fontSize: 13, color: '#576B82', marginTop: 4 }}>תודה, {data.directorName}. אישורך נרשם במערכת.</p>
              </>
            ) : (
              <>
                <XCircle size={48} color="#C81E1E" />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#C81E1E', marginTop: 12 }}>הפרוטוקול נדחה</h2>
                <p style={{ fontSize: 13, color: '#576B82', marginTop: 4 }}>תגובתך נרשמה במערכת.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3B4A5E', marginBottom: 6 }}>
                הערה (אופציונלי)
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="הוסף הערה לפרוטוקול..."
                rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #B8C4D1', borderRadius: 10, fontSize: 14, resize: 'vertical', direction: 'rtl' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => handleRespond('approved')}
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
                  background: submitting ? '#B8C4D1' : '#0D9440', color: 'white',
                  fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                <CheckCircle2 size={18} /> אשר פרוטוקול
              </button>
              <button
                onClick={() => handleRespond('rejected')}
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: 10,
                  border: '1px solid #C81E1E', background: '#FDD8D8', color: '#C81E1E',
                  fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                <XCircle size={18} /> דחה
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 10, color: '#B8C4D1' }}>
          RiskGuard © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
