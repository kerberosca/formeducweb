import aiWizardDataRaw from "@/data/ai_questions.fr-ca.json";
import cyberWizardDataRaw from "@/data/cybersecurity_questions.fr-ca.json";
import loi25WizardDataRaw from "@/data/loi25_questions.fr-ca.json";
import {
  getDiagnosticConfig,
  normalizeAssessmentType,
  type AssessmentType
} from "@/lib/diagnostics";
import type { WizardData, WizardQuestion, WizardSection } from "@/lib/scoring";
import { deepRepairText } from "@/lib/text";

export type WizardQuestionWithMeta = WizardQuestion & {
  helpText?: string;
};

export type LeadCaptureField = {
  id: "contactName" | "companyName" | "email" | "phone";
  label: string;
  type: "text" | "email" | "tel";
  required: boolean;
};

export type WizardDataset = WizardData & {
  report?: {
    sectionsScoring?: Array<{ sectionId: string; label: string }>;
    planTemplates?: {
      days30?: string[];
      days90?: string[];
    };
  };
  leadCapture: {
    fields: LeadCaptureField[];
    consent: {
      id: "consentMarketing";
      label: string;
      defaultChecked: boolean;
    };
  };
  questions: WizardQuestionWithMeta[];
};

export type WizardStep = {
  id: string;
  index: number;
  title: string;
  description?: string;
  section?: WizardSection;
  questions: WizardQuestionWithMeta[];
};

export type WizardFormDraft = {
  answers: Record<string, string | undefined>;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  consentMarketing: boolean;
};

type LocalStorageEnvelope<T> = {
  savedAt: string;
  data: T;
};

const WIZARD_STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const wizardDataByType: Record<AssessmentType, unknown> = {
  loi25: loi25WizardDataRaw,
  cybersecurity: cyberWizardDataRaw,
  ai: aiWizardDataRaw
};

export function getWizardData(
  assessmentType: AssessmentType = "loi25"
): WizardDataset {
  const normalizedType = normalizeAssessmentType(assessmentType);
  return deepRepairText(wizardDataByType[normalizedType] as WizardDataset);
}

export function getWizardStorageKey(
  assessmentType: AssessmentType,
  suffix: "draft" | "result"
) {
  return `${getDiagnosticConfig(assessmentType).storagePrefix}-${suffix}`;
}

export function getWizardSteps(wizard: WizardDataset): WizardStep[] {
  return wizard.sections.map((section, index) => ({
    id: section.id,
    index,
    title: section.title,
    description: section.description,
    section,
    questions: wizard.questions.filter(
      (question) => question.sectionId === section.id
    )
  }));
}

export function createEmptyDraft(): WizardFormDraft {
  return {
    answers: {},
    contactName: "",
    companyName: "",
    email: "",
    phone: "",
    consentMarketing: false
  };
}

function isEnvelope<T>(value: unknown): value is LocalStorageEnvelope<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeEnvelope = value as Partial<LocalStorageEnvelope<T>>;
  return typeof maybeEnvelope.savedAt === "string" && "data" in maybeEnvelope;
}

function loadFromStorage<T>(storageKey: string) {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isEnvelope<T>(parsed)) {
      const savedAt = Date.parse(parsed.savedAt);
      if (
        Number.isFinite(savedAt) &&
        Date.now() - savedAt > WIZARD_STORAGE_TTL_MS
      ) {
        window.localStorage.removeItem(storageKey);
        return null;
      }

      return parsed.data;
    }

    const legacyValue = parsed as T;
    saveToStorage(storageKey, legacyValue);
    return legacyValue;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function saveToStorage<T>(storageKey: string, value: T) {
  if (typeof window === "undefined") return;

  const envelope: LocalStorageEnvelope<T> = {
    savedAt: new Date().toISOString(),
    data: value
  };

  window.localStorage.setItem(storageKey, JSON.stringify(envelope));
}

export function loadWizardDraft(
  assessmentType: AssessmentType
): WizardFormDraft | null {
  return loadFromStorage<WizardFormDraft>(
    getWizardStorageKey(assessmentType, "draft")
  );
}

export function saveWizardDraft(
  value: WizardFormDraft,
  assessmentType: AssessmentType
) {
  saveToStorage(getWizardStorageKey(assessmentType, "draft"), value);
}

export function clearWizardDraft(assessmentType: AssessmentType) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getWizardStorageKey(assessmentType, "draft"));
}

export function loadWizardPersistedResult<T>(assessmentType: AssessmentType) {
  return loadFromStorage<T>(getWizardStorageKey(assessmentType, "result"));
}

export function saveWizardPersistedResult<T>(
  value: T,
  assessmentType: AssessmentType
) {
  saveToStorage(getWizardStorageKey(assessmentType, "result"), value);
}

export function clearWizardPersistedResult(assessmentType: AssessmentType) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getWizardStorageKey(assessmentType, "result"));
}

export function getRequiredQuestionIds(wizard: WizardDataset) {
  return wizard.questions
    .filter((question) => question.required)
    .map((question) => question.id);
}

export function validateWizardAnswers(
  wizard: WizardDataset,
  answers: Record<string, string | undefined>
) {
  const questionsById = new Map(
    wizard.questions.map((question) => [question.id, question])
  );
  const missingQuestionIds = getRequiredQuestionIds(wizard).filter(
    (id) => !answers[id]
  );
  const unknownQuestionIds = Object.keys(answers).filter(
    (id) => !questionsById.has(id)
  );
  const invalidQuestionIds = Object.entries(answers)
    .filter(([, value]) => value !== undefined && value !== "")
    .filter(([id, value]) => {
      const question = questionsById.get(id);
      return Boolean(
        question?.options?.length &&
        !question.options.some((option) => option.value === value)
      );
    })
    .map(([id]) => id);

  return { missingQuestionIds, invalidQuestionIds, unknownQuestionIds };
}

export function getCompletionPercent(
  wizard: WizardDataset,
  answers: Record<string, string | undefined>,
  currentStepIndex: number
) {
  const requiredQuestions = wizard.questions.filter(
    (question) => question.required
  );
  const answeredRequired = requiredQuestions.filter((question) => {
    const answer = answers[question.id];
    return typeof answer === "string" && answer.length > 0;
  }).length;

  const questionPercent =
    requiredQuestions.length > 0
      ? Math.round((answeredRequired / requiredQuestions.length) * 100)
      : 0;

  const stepPercent = Math.round(
    ((currentStepIndex + 1) / wizard.sections.length) * 100
  );

  return Math.max(questionPercent, stepPercent);
}
