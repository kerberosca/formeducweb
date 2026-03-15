import wizardDataRaw from "@/data/loi25_questions.fr-ca.json";
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

export const WIZARD_STORAGE_KEY = "formeducweb-loi25-draft";
export const WIZARD_RESULT_STORAGE_KEY = "formeducweb-loi25-result";

export function getWizardData(): WizardDataset {
  return deepRepairText(wizardDataRaw as unknown as WizardDataset);
}

export function getWizardSteps(wizard: WizardDataset): WizardStep[] {
  return wizard.sections.map((section, index) => ({
    id: section.id,
    index,
    title: section.title,
    description: section.description,
    section,
    questions: wizard.questions.filter((question) => question.sectionId === section.id)
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
      if (Number.isFinite(savedAt) && Date.now() - savedAt > WIZARD_STORAGE_TTL_MS) {
        window.localStorage.removeItem(storageKey);
        return null;
      }

      return parsed.data;
    }

    return parsed as T;
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

export function loadWizardDraft(): WizardFormDraft | null {
  return loadFromStorage<WizardFormDraft>(WIZARD_STORAGE_KEY);
}

export function saveWizardDraft(value: WizardFormDraft) {
  saveToStorage(WIZARD_STORAGE_KEY, value);
}

export function clearWizardDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WIZARD_STORAGE_KEY);
}

export function loadWizardPersistedResult<T>() {
  return loadFromStorage<T>(WIZARD_RESULT_STORAGE_KEY);
}

export function saveWizardPersistedResult<T>(value: T) {
  saveToStorage(WIZARD_RESULT_STORAGE_KEY, value);
}

export function clearWizardPersistedResult() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WIZARD_RESULT_STORAGE_KEY);
}

export function getRequiredQuestionIds(wizard: WizardDataset) {
  return wizard.questions.filter((question) => question.required).map((question) => question.id);
}

export function getCompletionPercent(
  wizard: WizardDataset,
  answers: Record<string, string | undefined>,
  currentStepIndex: number
) {
  const requiredQuestions = wizard.questions.filter((question) => question.required);
  const answeredRequired = requiredQuestions.filter((question) => {
    const answer = answers[question.id];
    return typeof answer === "string" && answer.length > 0;
  }).length;

  const questionPercent =
    requiredQuestions.length > 0
      ? Math.round((answeredRequired / requiredQuestions.length) * 100)
      : 0;

  const stepPercent = Math.round(((currentStepIndex + 1) / (wizard.sections.length + 1)) * 100);

  return Math.max(questionPercent, stepPercent);
}
