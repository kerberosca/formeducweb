import type { GeneratedReport } from "@/lib/recommendations";
import type { LiteReport } from "@/lib/reportFilters";
import type { LeadCaptureInput } from "@/lib/schemas";
import type { ScoreResult } from "@/lib/scoring";
import type { AssessmentType } from "@/lib/diagnostics";

export type AssessmentPaymentStatus = "unpaid" | "paid" | "refunded";

export type AssessmentApiResponse = {
  assessmentType: AssessmentType;
  assessmentId: string;
  accessToken: string;
  paymentStatus: AssessmentPaymentStatus;
  scoreResult: ScoreResult;
  liteReport: LiteReport;
};

export type AssessmentPreviewResponse = {
  assessmentType: AssessmentType;
  scoreResult: ScoreResult;
  liteReport: LiteReport;
};

export type PersistedAssessmentResult = AssessmentApiResponse & {
  leadCapture: LeadCaptureInput;
  answers: Record<string, string | undefined>;
};

export type AssessmentPreviewState = AssessmentPreviewResponse & {
  kind: "preview";
  answers: Record<string, string | undefined>;
};

export type SavedAssessmentState = PersistedAssessmentResult & {
  kind: "saved";
};

export type WizardResultState = AssessmentPreviewState | SavedAssessmentState;

export type FullReportPayload = {
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  report: GeneratedReport;
  accessToken: string;
  paymentStatus: AssessmentPaymentStatus;
};
