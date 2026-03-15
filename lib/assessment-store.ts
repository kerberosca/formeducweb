import { randomBytes } from "node:crypto";

import type { Assessment, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { GeneratedReport } from "@/lib/recommendations";
import type { LiteReport } from "@/lib/reportFilters";
import type { LeadCaptureInput } from "@/lib/schemas";
import type { AssessmentAnswers, ScoreResult } from "@/lib/scoring";
import { computeScore } from "@/lib/scoring";
import { deepRepairText } from "@/lib/text";
import { getWizardData } from "@/lib/wizard";

export type HydratedAssessment = {
  assessment: Assessment;
  answers: AssessmentAnswers;
  scoreResult: ScoreResult;
  liteReport: LiteReport;
  fullReport: GeneratedReport;
};

function createAccessToken() {
  return randomBytes(24).toString("hex");
}

function cleanAnswers(answers: AssessmentAnswers) {
  return Object.fromEntries(Object.entries(answers).filter(([, value]) => value !== undefined));
}

export async function createAssessmentRecord(input: {
  leadCapture: LeadCaptureInput;
  answers: AssessmentAnswers;
  scoreResult: ScoreResult;
  liteReport: LiteReport;
  fullReport: GeneratedReport;
}) {
  const answers = cleanAnswers(input.answers);

  return db.assessment.create({
    data: {
      contactName: input.leadCapture.contactName,
      companyName: input.leadCapture.companyName,
      email: input.leadCapture.email,
      phone: input.leadCapture.phone || null,
      consentMarketing: input.leadCapture.consentMarketing ?? false,
      answers: answers as Prisma.InputJsonValue,
      score: input.scoreResult.overallScore,
      level: input.scoreResult.level.label,
      reportLite: input.liteReport as Prisma.InputJsonValue,
      reportFull: input.fullReport as Prisma.InputJsonValue,
      paymentStatus: "unpaid",
      accessToken: createAccessToken()
    }
  });
}

export async function findAssessmentById(id: string) {
  return db.assessment.findUnique({ where: { id } });
}

export async function findAssessmentByToken(accessToken: string) {
  return db.assessment.findUnique({ where: { accessToken } });
}

export async function findAssessmentByStripeSessionId(stripeSessionId: string) {
  return db.assessment.findFirst({ where: { stripeSessionId } });
}

export async function attachCheckoutSession(assessmentId: string, stripeSessionId: string) {
  return db.assessment.update({
    where: { id: assessmentId },
    data: { stripeSessionId }
  });
}

export async function markAssessmentPaid(input: {
  assessmentId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
}) {
  return db.assessment.update({
    where: { id: input.assessmentId },
    data: {
      paymentStatus: "paid",
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntent: input.stripePaymentIntentId ?? null
    }
  });
}

export async function markAssessmentRefundedByPaymentIntent(stripePaymentIntentId: string) {
  return db.assessment.updateMany({
    where: { stripePaymentIntent: stripePaymentIntentId },
    data: {
      paymentStatus: "refunded"
    }
  });
}

export function hydrateAssessment(assessment: Assessment): HydratedAssessment {
  const wizard = getWizardData();
  const answers = (assessment.answers as AssessmentAnswers) ?? {};
  const scoreResult = deepRepairText(computeScore(wizard, answers));

  return {
    assessment,
    answers,
    scoreResult,
    liteReport: deepRepairText(assessment.reportLite as unknown as LiteReport),
    fullReport: deepRepairText(assessment.reportFull as unknown as GeneratedReport)
  };
}

function getRetentionDays(envKey: "ASSESSMENT_RETENTION_UNPAID_DAYS" | "ASSESSMENT_RETENTION_PAID_DAYS", fallback: number) {
  const value = Number(process.env[envKey]);
  return Number.isFinite(value) && value >= 30 ? Math.round(value) : fallback;
}

export async function cleanupAssessmentRetention() {
  const unpaidDays = getRetentionDays("ASSESSMENT_RETENTION_UNPAID_DAYS", 180);
  const paidDays = getRetentionDays("ASSESSMENT_RETENTION_PAID_DAYS", 730);
  const now = Date.now();
  const unpaidBefore = new Date(now - unpaidDays * 24 * 60 * 60 * 1000);
  const paidBefore = new Date(now - paidDays * 24 * 60 * 60 * 1000);

  return db.assessment.deleteMany({
    where: {
      OR: [
        {
          paymentStatus: "unpaid",
          createdAt: {
            lt: unpaidBefore
          }
        },
        {
          paymentStatus: {
            in: ["paid", "refunded"]
          },
          createdAt: {
            lt: paidBefore
          }
        }
      ]
    }
  });
}



