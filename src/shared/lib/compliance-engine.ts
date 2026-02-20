/**
 * Compliance Score Engine
 * Calculates weighted compliance scores across modules.
 * Every module score = met / reqs.
 * Overall score = Σ(module_score × module_weight) / Σ(weights).
 * Weights reflect regulatory importance (ISA circulars).
 */

export type ModuleScore = {
  id: string;
  name: string;
  reqs: number;
  met: number;
  reg: string;      // 'risk' | 'cyber'
  weight: number;    // regulatory weight
};

export type ScoreResult = {
  overall: number;           // 0-100
  byModule: { id: string; name: string; score: number; gap: number }[];
  byRegulation: Record<string, { score: number; reqs: number; met: number }>;
  totalReqs: number;
  totalMet: number;
  color: string;
};

/** Default module weights — higher = more ISA emphasis */
export const MODULE_WEIGHTS: Record<string, number> = {
  gov:    3,   // ממשל סיכונים — core governance
  ops:    2,   // סיכון תפעולי
  out:    1.5, // מיקור חוץ
  bcp:    2,   // המשכיות עסקית
  cgov:   2.5, // ממשל סייבר
  cpro:   2.5, // הגנת סייבר
  cinc:   2,   // אירועי סייבר
  credit: 2,   // סיכון אשראי
  kri:    1.5, // מדדי סיכון
  events: 1,   // דיווח אירועים
  reports: 1,  // דוחות
};

const COLORS = {
  success: '#2E8B57',
  warning: '#C8922A',
  danger:  '#C0392B',
};

export function scoreColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 50) return COLORS.warning;
  return COLORS.danger;
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'תקין';
  if (score >= 50) return 'חלקי';
  return 'לא עומד';
}

/**
 * Compute compliance scores for a set of modules.
 */
export function computeCompliance(modules: ModuleScore[]): ScoreResult {
  const byModule = modules.map((m) => {
    const score = m.reqs > 0 ? Math.round((m.met / m.reqs) * 100) : 0;
    return { id: m.id, name: m.name, score, gap: m.reqs - m.met };
  });

  // Weighted overall score
  let weightedSum = 0;
  let weightTotal = 0;
  for (const m of modules) {
    const w = m.weight ?? MODULE_WEIGHTS[m.id] ?? 1;
    const pct = m.reqs > 0 ? (m.met / m.reqs) * 100 : 0;
    weightedSum += pct * w;
    weightTotal += w;
  }
  const overall = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;

  // By regulation
  const regMap: Record<string, { reqs: number; met: number }> = {};
  for (const m of modules) {
    if (!regMap[m.reg]) regMap[m.reg] = { reqs: 0, met: 0 };
    regMap[m.reg].reqs += m.reqs;
    regMap[m.reg].met += m.met;
  }
  const byRegulation: Record<string, { score: number; reqs: number; met: number }> = {};
  for (const [reg, data] of Object.entries(regMap)) {
    byRegulation[reg] = {
      ...data,
      score: data.reqs > 0 ? Math.round((data.met / data.reqs) * 100) : 0,
    };
  }

  const totalReqs = modules.reduce((a, m) => a + m.reqs, 0);
  const totalMet = modules.reduce((a, m) => a + m.met, 0);

  return {
    overall,
    byModule,
    byRegulation,
    totalReqs,
    totalMet,
    color: scoreColor(overall),
  };
}

/**
 * Quick helper: compute a single module's compliance %.
 */
export function moduleScore(reqs: number, met: number): number {
  return reqs > 0 ? Math.round((met / reqs) * 100) : 0;
}
