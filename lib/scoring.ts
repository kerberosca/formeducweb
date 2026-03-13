// lib/scoring.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnswerValue = string | number | boolean | null;

export type WizardQuestion = {
  id: string;
  sectionId: string;
  title: string;
  type: string;
  required: boolean;
  weight: number; // 0 = profil seulement
  options?: Array<{ value: string; label: string }>;
  scoreMap: Record<string, number>; // maps option value -> 0..4
  recommendation?: { title: string; text: string } | null;
};

export type WizardSection = {
  id: string;
  title: string;
  description?: string;
};

export type ScoringConfig = {
  levels: Array<{ min: number; max: number; label: string; tagline: string }>;
  recommendationSelection: { topGapsCount: number; threshold: number };
};

export type WizardData = {
  version: string;
  locale: string;
  title: string;
  subtitle?: string;
  disclaimer?: string;
  scoring: ScoringConfig;
  sections: WizardSection[];
  questions: WizardQuestion[];
};

export type AssessmentAnswers = Record<string, any>;

export type SectionScore = {
  sectionId: string;
  sectionTitle?: string;
  rawWeightedEarned: number;
  rawWeightedMax: number;
  percent: number; // 0..100
};

export type GapItem = {
  questionId: string;
  sectionId: string;
  sectionTitle?: string;
  title: string;
  weight: number;
  answerValue: any;
  answerScore: number; // 0..4
  recommendation?: { title: string; text: string } | null;
  severity: number; // computed 0..100
};

export type ScoreResult = {
  overallScore: number; // 0..100
  level: { label: string; tagline: string };
  sectionScores: SectionScore[];
  gaps: GapItem[]; // top gaps
  answeredCount: number;
  applicableCount: number;
  notes: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Convert an answer into a 0..4 score.
 * - For select/yes_no types, we use scoreMap.
 * - For missing/unknown answers, returns 0 by default.
 * - If answer is "na" (not applicable), we treat it as 4 *unless* you want to treat NA differently.
 */
export function getAnswerScore(question: WizardQuestion, answer: any): number {
  if (answer === undefined || answer === null || answer === "") return 0;

  // Convention: allow "na" to score as 4 for non-applicable cases
  if (typeof answer === "string" && answer.toLowerCase() === "na") {
    // if question has an explicit mapping, prefer it
    const mapped = question.scoreMap?.[answer];
    return typeof mapped === "number" ? clamp(mapped, 0, 4) : 4;
  }

  // Typical selection values are strings
  if (typeof answer === "string" || typeof answer === "number" || typeof answer === "boolean") {
    const key = String(answer);
    const mapped = question.scoreMap?.[key];
    if (typeof mapped === "number") return clamp(mapped, 0, 4);
  }

  return 0;
}

/**
 * Compute overall normalized score:
 * sum(answerScore/4 * weight) / sum(weight) * 100
 * Only weights > 0 are counted.
 */
export function computeScore(wizard: WizardData, answers: AssessmentAnswers): ScoreResult {
  const notes: string[] = [];
  const scoredQuestions = wizard.questions.filter((q) => (q.weight ?? 0) > 0);

  let weightedEarned = 0;
  let weightedMax = 0;

  let answeredCount = 0;
  let applicableCount = 0;

  // per-section accumulators
  const sectionMap: Record<string, SectionScore> = {};
  for (const s of wizard.sections) {
    sectionMap[s.id] = {
      sectionId: s.id,
      sectionTitle: s.title,
      rawWeightedEarned: 0,
      rawWeightedMax: 0,
      percent: 0
    };
  }

  // gather gaps candidates
  const gapCandidates: GapItem[] = [];

  for (const q of scoredQuestions) {
    const ans = answers[q.id];
    const score04 = getAnswerScore(q, ans);

    // Track answered/applicable
    // If "na" or mapped NA, we consider it applicable but "handled". You can adjust if needed.
    if (ans !== undefined && ans !== null && ans !== "") answeredCount += 1;
    applicableCount += 1;

    const w = q.weight ?? 0;
    const earned = (score04 / 4) * w;

    weightedEarned += earned;
    weightedMax += w;

    // section
    if (!sectionMap[q.sectionId]) {
      sectionMap[q.sectionId] = {
        sectionId: q.sectionId,
        sectionTitle: q.sectionId,
        rawWeightedEarned: 0,
        rawWeightedMax: 0,
        percent: 0
      };
    }
    sectionMap[q.sectionId].rawWeightedEarned += earned;
    sectionMap[q.sectionId].rawWeightedMax += w;

    // gap detection
    const threshold = wizard.scoring.recommendationSelection.threshold;
    const isBelow = score04 < threshold;

    if (isBelow) {
      // severity = how far from perfect, weighted
      // score04=0 => max severity; score04=3 => low severity
      const distance = (4 - score04) / 4; // 0..1
      const severity = clamp(distance * (w / 10) * 100, 0, 100); // normalize roughly
      gapCandidates.push({
        questionId: q.id,
        sectionId: q.sectionId,
        sectionTitle: sectionMap[q.sectionId]?.sectionTitle,
        title: q.title,
        weight: w,
        answerValue: ans,
        answerScore: score04,
        recommendation: q.recommendation ?? null,
        severity
      });
    }
  }

  const overallScore = weightedMax > 0 ? Math.round((weightedEarned / weightedMax) * 100) : 0;

  // levels
  const level =
    wizard.scoring.levels.find((lvl) => overallScore >= lvl.min && overallScore <= lvl.max) ??
    wizard.scoring.levels[wizard.scoring.levels.length - 1];

  // per-section percents
  const sectionScores = Object.values(sectionMap)
    .filter((s) => s.rawWeightedMax > 0)
    .map((s) => ({
      ...s,
      percent: s.rawWeightedMax > 0 ? Math.round((s.rawWeightedEarned / s.rawWeightedMax) * 100) : 0
    }))
    .sort((a, b) => a.sectionId.localeCompare(b.sectionId));

  // top gaps selection:
  // sort by weight desc, then severity desc
  const topGapsCount = wizard.scoring.recommendationSelection.topGapsCount ?? 5;
  const gaps = gapCandidates
    .sort((a, b) => (b.weight - a.weight) || (b.severity - a.severity))
    .slice(0, topGapsCount);

  // notes
  if (answeredCount < Math.ceil(applicableCount * 0.7)) {
    notes.push(
      "Plusieurs questions n’ont pas été répondues. Le score est indicatif et pourrait changer avec un questionnaire complété."
    );
  }
  if (overallScore < 40) notes.push("Priorité: mettre en place les bases (inventaire, politique, accès, sauvegardes, registre).");
  if (overallScore >= 70) notes.push("Bon niveau de préparation. Assurez-vous de maintenir et documenter vos pratiques.");

  return {
    overallScore,
    level: { label: level.label, tagline: level.tagline },
    sectionScores,
    gaps,
    answeredCount,
    applicableCount,
    notes
  };
}