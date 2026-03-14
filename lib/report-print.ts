import type { GeneratedReport } from "@/lib/recommendations";
import type { ScoreResult } from "@/lib/scoring";
import type { LeadCaptureInput } from "@/lib/schemas";
import type { WizardDataset } from "@/lib/wizard";

export const REPORT_PRINT_STORAGE_KEY = "formeducweb-loi25-print-report";

export type StoredAssessmentReport = {
  wizard: WizardDataset;
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  report: GeneratedReport;
  savedAt: string;
};

let cachedRawReport: string | null | undefined;
let cachedParsedReport: StoredAssessmentReport | null = null;

export function persistAssessmentReport(payload: StoredAssessmentReport) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(payload);
  window.localStorage.setItem(REPORT_PRINT_STORAGE_KEY, raw);
  cachedRawReport = raw;
  cachedParsedReport = payload;
}

export function readAssessmentReport() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(REPORT_PRINT_STORAGE_KEY);
  if (raw === cachedRawReport) {
    return cachedParsedReport;
  }

  cachedRawReport = raw;

  if (!raw) {
    cachedParsedReport = null;
    return null;
  }

  try {
    cachedParsedReport = JSON.parse(raw) as StoredAssessmentReport;
    return cachedParsedReport;
  } catch {
    cachedParsedReport = null;
    return null;
  }
}

export function clearAssessmentReport() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(REPORT_PRINT_STORAGE_KEY);
  cachedRawReport = null;
  cachedParsedReport = null;
}
