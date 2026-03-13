import wizardDataRaw from "@/data/loi25_questions.fr-ca.json";
import type { WizardData, WizardQuestion, WizardSection } from "@/lib/scoring";

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

export const WIZARD_STORAGE_KEY = "formeducweb-loi25-draft";

export function getWizardData(): WizardDataset {
  return wizardDataRaw as unknown as WizardDataset;
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

export function loadWizardDraft(): WizardFormDraft | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WizardFormDraft;
  } catch {
    return null;
  }
}

export function saveWizardDraft(value: WizardFormDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(value));
}

export function clearWizardDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WIZARD_STORAGE_KEY);
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
