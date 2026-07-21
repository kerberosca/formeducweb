"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Save,
  ShieldCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { LiteResultView } from "@/components/wizard/lite-result-view";
import { QuestionField } from "@/components/wizard/question-field";
import { WizardStepper } from "@/components/wizard/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { getFirstTouchAttribution } from "@/lib/attribution";
import type {
  AssessmentApiResponse,
  AssessmentPreviewResponse,
  PersistedAssessmentResult,
  SavedAssessmentState,
  WizardResultState
} from "@/lib/assessment-types";
import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import { deepRepairText } from "@/lib/text";
import {
  clearWizardDraft,
  clearWizardPersistedResult,
  createEmptyDraft,
  getCompletionPercent,
  getWizardSteps,
  loadWizardDraft,
  loadWizardPersistedResult,
  saveWizardDraft,
  saveWizardPersistedResult,
  type WizardDataset,
  type WizardFormDraft
} from "@/lib/wizard";

type WizardFormValues = {
  answers: Record<string, string | undefined>;
};

function buildDraft(
  answers: Record<string, string | undefined>
): WizardFormDraft {
  return {
    ...createEmptyDraft(),
    answers
  };
}

function hasDraftContent(draft: WizardFormDraft | null) {
  return Boolean(draft && Object.values(draft.answers).some(Boolean));
}

export function normalizeStoredResult(
  value: unknown
): WizardResultState | null {
  if (!value || typeof value !== "object") return null;

  const stored = value as Partial<
    WizardResultState & PersistedAssessmentResult
  >;
  if (stored.kind === "preview" || stored.kind === "saved") {
    return stored as WizardResultState;
  }

  if (
    stored.assessmentId &&
    stored.accessToken &&
    stored.leadCapture &&
    stored.answers
  ) {
    return { ...stored, kind: "saved" } as SavedAssessmentState;
  }

  return null;
}

function formatLastSaved(isoDate: string) {
  const savedAt = Date.parse(isoDate);
  if (!Number.isFinite(savedAt)) return "inconnue";
  if (Date.now() - savedAt < 60 * 1000) return "à l’instant";

  return new Date(savedAt).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function AssessmentWizard({
  assessmentType,
  wizard,
  reportUnlockPriceLabel
}: {
  assessmentType: AssessmentType;
  wizard: WizardDataset;
  reportUnlockPriceLabel: string;
}) {
  const diagnostic = getDiagnosticConfig(assessmentType);
  const steps = useMemo(() => getWizardSteps(wizard), [wizard]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>(
    {}
  );
  const [resultState, setResultState] = useState<WizardResultState | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<WizardFormDraft | null>(
    null
  );
  const [draftReady, setDraftReady] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const form = useForm<WizardFormValues>({
    defaultValues: { answers: {} }
  });
  const answers = form.watch("answers") || {};
  const currentStep = steps[currentStepIndex];
  const completionPercent = getCompletionPercent(
    wizard,
    answers,
    currentStepIndex
  );
  const answeredCount = wizard.questions.filter((question) =>
    Boolean(answers[question.id])
  ).length;

  useEffect(() => {
    const restoredResult = normalizeStoredResult(
      deepRepairText(
        loadWizardPersistedResult<
          WizardResultState | PersistedAssessmentResult
        >(assessmentType)
      )
    );

    if (restoredResult?.assessmentType === assessmentType) {
      setResultState(restoredResult);
      form.reset({ answers: restoredResult.answers });
      setDraftReady(true);
      return;
    }

    const draft = loadWizardDraft(assessmentType);
    if (hasDraftContent(draft)) setPendingDraft(draft);
    setDraftReady(true);
  }, [assessmentType, form]);

  useEffect(() => {
    if (!draftReady || pendingDraft || resultState) return;

    const subscription = form.watch((values) => {
      saveWizardDraft(
        buildDraft(
          (values.answers as Record<string, string | undefined>) ?? {}
        ),
        assessmentType
      );
    });

    return () => subscription.unsubscribe();
  }, [assessmentType, draftReady, form, pendingDraft, resultState]);

  useEffect(() => {
    if (!draftReady) return;
    trackAnalyticsEvent("diagnostic_start", {
      diagnostic_type: assessmentType
    });
  }, [assessmentType, draftReady]);

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    form.reset({ answers: pendingDraft.answers });
    setPendingDraft(null);
    setLastSavedAt(new Date().toISOString());
    toast.success("Votre progression a été restaurée.");
  };

  const handleDiscardDraft = () => {
    clearWizardDraft(assessmentType);
    clearWizardPersistedResult(assessmentType);
    form.reset({ answers: {} });
    setPendingDraft(null);
    setCurrentStepIndex(0);
    setQuestionErrors({});
    setResultState(null);
    setLastSavedAt(null);
    toast.success("La sauvegarde locale a été effacée.");
  };

  const validateCurrentStep = () => {
    const missing = currentStep.questions.filter(
      (question) => question.required && !answers[question.id]
    );
    if (!missing.length) {
      setQuestionErrors({});
      return true;
    }

    setQuestionErrors(
      Object.fromEntries(
        missing.map((question) => [
          question.id,
          "Veuillez sélectionner une réponse pour continuer."
        ])
      )
    );
    toast.error("Il manque quelques réponses avant de continuer.");
    window.setTimeout(
      () => document.getElementById(`question-${missing[0].id}`)?.focus(),
      0
    );
    return false;
  };

  const generatePreview = async () => {
    setGenerationError(null);
    setIsGenerating(true);
    try {
      const response = await fetch("/api/assessment/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentType, answers })
      });
      const payload = (await response.json()) as AssessmentPreviewResponse & {
        error?: string;
      };

      if (!response.ok)
        throw new Error(
          payload.error ||
            "Impossible de calculer votre résultat pour le moment."
        );

      const preview: WizardResultState = deepRepairText({
        kind: "preview",
        ...payload,
        answers
      });
      clearWizardDraft(assessmentType);
      saveWizardPersistedResult(preview, assessmentType);
      setResultState(preview);
      setLastSavedAt(null);
      trackAnalyticsEvent("diagnostic_preview_generated", {
        diagnostic_type: assessmentType,
        score: payload.scoreResult.overallScore
      });
      toast.success("Votre résultat gratuit est prêt.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      setGenerationError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    trackAnalyticsEvent("diagnostic_section_complete", {
      diagnostic_type: assessmentType,
      section: currentStep.id
    });

    if (currentStepIndex < steps.length - 1) {
      goToStep(currentStepIndex + 1);
      return;
    }

    await generatePreview();
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    form.setValue(`answers.${questionId}`, value, {
      shouldDirty: true,
      shouldTouch: true
    });
    setQuestionErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  };

  const handleSavePreview = async (
    email: string,
    consentMarketing: boolean
  ) => {
    if (!resultState || resultState.kind !== "preview") return;

    const response = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentType,
        email,
        consentMarketing,
        answers: resultState.answers,
        attribution: getFirstTouchAttribution()
      })
    });
    const payload = (await response.json()) as AssessmentApiResponse & {
      error?: string;
    };
    if (!response.ok)
      throw new Error(
        payload.error ||
          "Impossible de sauvegarder votre résultat pour le moment."
      );

    const saved: SavedAssessmentState = deepRepairText({
      kind: "saved",
      ...payload,
      leadCapture: {
        contactName: "",
        companyName: "",
        email,
        phone: "",
        consentMarketing
      },
      answers: resultState.answers
    });
    saveWizardPersistedResult(saved, assessmentType);
    setResultState(saved);
    trackAnalyticsEvent("diagnostic_saved", {
      diagnostic_type: assessmentType
    });
    toast.success(
      "Votre résultat est sauvegardé. Un lien sécurisé vous a été envoyé."
    );
  };

  const handleProfileSaved = (contactName: string, companyName: string) => {
    setResultState((current) => {
      if (!current || current.kind !== "saved") return current;
      const next: SavedAssessmentState = {
        ...current,
        leadCapture: { ...current.leadCapture, contactName, companyName }
      };
      saveWizardPersistedResult(next, assessmentType);
      return next;
    });
  };

  const handleEditResult = () => {
    clearWizardPersistedResult(assessmentType);
    setResultState(null);
    setLastSavedAt(null);
    toast.success(
      "Vous pouvez ajuster vos réponses et recalculer votre résultat."
    );
  };

  const handleRestart = () => {
    clearWizardDraft(assessmentType);
    clearWizardPersistedResult(assessmentType);
    form.reset({ answers: {} });
    setQuestionErrors({});
    setCurrentStepIndex(0);
    setResultState(null);
    setPendingDraft(null);
    setLastSavedAt(null);
    toast.success("L’assistant a été remis à zéro.");
  };

  if (resultState) {
    return (
      <LiteResultView
        resultState={resultState}
        priceLabel={reportUnlockPriceLabel}
        onSavePreview={handleSavePreview}
        onProfileSaved={handleProfileSaved}
        onEdit={handleEditResult}
        onRestart={handleRestart}
        mainHeadingLevel="h2"
      />
    );
  }

  return (
    <section className="container py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
        <div className="space-y-5 lg:sticky lg:top-28">
          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress
                value={completionPercent}
                aria-label="Progression du questionnaire"
              />
              <p className="text-sm text-muted-foreground">
                {answeredCount} question{answeredCount > 1 ? "s" : ""} sur{" "}
                {wizard.questions.length}
              </p>
            </CardContent>
          </Card>
          <WizardStepper steps={steps} currentStepIndex={currentStepIndex} />
        </div>

        <div className="space-y-6">
          {pendingDraft ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="eyebrow">Sauvegarde trouvée</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Une progression locale a été trouvée dans ce navigateur.
                    Vous pouvez la reprendre ou repartir à neuf.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" onClick={handleRestoreDraft}>
                    Reprendre ma progression
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleDiscardDraft}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Recommencer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">Questionnaire</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />{" "}
                  {diagnostic.disclaimerBadge}
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                  {currentStep.title}
                </h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  {currentStep.description ||
                    "Répondez avec franchise pour obtenir un portrait plus utile."}
                </p>
              </div>
              <p className="rounded-[24px] border border-border/70 bg-muted/30 p-5 text-sm leading-7 text-muted-foreground">
                Vos réponses restent sur cet appareil pendant votre progression.
                Aucun dossier n’est créé avant que vous choisissiez de
                sauvegarder votre résultat par courriel.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-5" aria-live="polite">
            {currentStep.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                error={questionErrors[question.id]}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            ))}
          </div>

          {generationError ? (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {generationError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Étape {currentStepIndex + 1} sur {steps.length}
              </p>
              <p className="text-xs text-muted-foreground/80">
                Dernière sauvegarde :{" "}
                {lastSavedAt
                  ? formatLastSaved(lastSavedAt)
                  : "automatique sur cet appareil"}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {currentStepIndex > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => goToStep(currentStepIndex - 1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  saveWizardDraft(buildDraft(answers), assessmentType);
                  setLastSavedAt(new Date().toISOString());
                  toast.success("Brouillon enregistré localement.");
                }}
              >
                <Save className="mr-2 h-4 w-4" /> Sauvegarder
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "Calcul en cours…"
                ) : currentStepIndex === steps.length - 1 ? (
                  "Voir mon score gratuit"
                ) : (
                  <>
                    <span>Continuer</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
