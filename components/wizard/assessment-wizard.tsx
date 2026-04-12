"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { QuestionField } from "@/components/wizard/question-field";
import { LiteResultView } from "@/components/wizard/lite-result-view";
import { WizardStepper } from "@/components/wizard/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { AssessmentApiResponse, PersistedAssessmentResult } from "@/lib/assessment-types";
import { trackGoogleAdsLead } from "@/lib/google-ads";
import { trackMetaLead } from "@/lib/meta-pixel";
import { assessmentAnswersSchema, leadCaptureSchema, type LeadCaptureInput } from "@/lib/schemas";
import {
  clearWizardDraft,
  clearWizardPersistedResult,
  createEmptyDraft,
  getCompletionPercent,
  getRequiredQuestionIds,
  getWizardSteps,
  loadWizardDraft,
  loadWizardPersistedResult,
  saveWizardDraft,
  saveWizardPersistedResult,
  type WizardDataset,
  type WizardFormDraft
} from "@/lib/wizard";

const wizardClientSchema = leadCaptureSchema.extend({
  answers: assessmentAnswersSchema
});

type WizardFormValues = z.infer<typeof wizardClientSchema>;

type WizardResultState = PersistedAssessmentResult;

function hasDraftContent(draft: WizardFormDraft | null) {
  if (!draft) return false;

  const hasAnswers = Object.values(draft.answers).some((value) => Boolean(value));
  const hasLead = Boolean(draft.contactName || draft.companyName || draft.email || draft.phone);

  return hasAnswers || hasLead;
}

function buildDraftFromValues(values: Partial<WizardFormValues>): WizardFormDraft {
  return {
    answers: values.answers ?? {},
    contactName: values.contactName ?? "",
    companyName: values.companyName ?? "",
    email: values.email ?? "",
    phone: values.phone ?? "",
    consentMarketing: values.consentMarketing ?? false
  };
}

function formatLastSaved(isoDate: string) {
  const savedAt = Date.parse(isoDate);
  if (!Number.isFinite(savedAt)) return "inconnue";

  const diffMs = Date.now() - savedAt;
  if (diffMs < 60 * 1000) {
    return "a l'instant";
  }

  return new Date(savedAt).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function AssessmentWizard({
  wizard,
  reportUnlockPriceLabel
}: {
  wizard: WizardDataset;
  reportUnlockPriceLabel: string;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [resultState, setResultState] = useState<WizardResultState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<WizardFormDraft | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const sectionSteps = useMemo(
    () => getWizardSteps(wizard).map((step) => ({ ...step, kind: "questions" as const })),
    [wizard]
  );

  const steps = useMemo(
    () => [
      ...sectionSteps,
      {
        id: "lead",
        index: sectionSteps.length,
        kind: "lead" as const,
        title: "Coordonnées",
        description: "Recevez votre résumé gratuit et choisissez la suite au besoin."
      }
    ],
    [sectionSteps]
  );

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(wizardClientSchema),
    defaultValues: createEmptyDraft()
  });

  const answers = form.watch("answers") || {};
  const currentStep = steps[currentStepIndex];
  const completionPercent = getCompletionPercent(wizard, answers, currentStepIndex);

  const saveDraftSnapshot = (values?: Partial<WizardFormValues>, updateIndicator = true) => {
    if (!draftReady || pendingDraft || resultState) return;

    const draft = buildDraftFromValues(values ?? form.getValues());
    saveWizardDraft(draft);

    if (updateIndicator) {
      setLastSavedAt(new Date().toISOString());
    }
  };

  useEffect(() => {
    const restoredResult = loadWizardPersistedResult<WizardResultState>();

    if (restoredResult) {
      setResultState(restoredResult);
      form.reset({
        answers: restoredResult.answers,
        contactName: restoredResult.leadCapture.contactName,
        companyName: restoredResult.leadCapture.companyName,
        email: restoredResult.leadCapture.email,
        phone: restoredResult.leadCapture.phone,
        consentMarketing: restoredResult.leadCapture.consentMarketing
      });
      setLastSavedAt(null);
      setDraftReady(true);
      return;
    }

    const draft = loadWizardDraft();

    if (hasDraftContent(draft)) {
      setPendingDraft(draft);
    }

    setDraftReady(true);
  }, [form]);

  useEffect(() => {
    if (!draftReady || pendingDraft || resultState) return;

    const subscription = form.watch((values) => {
      saveWizardDraft(buildDraftFromValues(values));
    });

    return () => subscription.unsubscribe();
  }, [draftReady, pendingDraft, resultState, form]);

  useEffect(() => {
    if (!draftReady || pendingDraft || resultState) return;

    const persist = (updateIndicator: boolean) => {
      const draft = buildDraftFromValues(form.getValues());
      saveWizardDraft(draft);

      if (updateIndicator) {
        setLastSavedAt(new Date().toISOString());
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      persist(true);
    };

    const handleBeforeUnload = () => {
      persist(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [draftReady, pendingDraft, resultState, form]);

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;

    form.reset({
      answers: pendingDraft.answers,
      contactName: pendingDraft.contactName,
      companyName: pendingDraft.companyName,
      email: pendingDraft.email,
      phone: pendingDraft.phone,
      consentMarketing: pendingDraft.consentMarketing
    });
    setPendingDraft(null);
    setLastSavedAt(new Date().toISOString());
    toast.success("Votre progression a été restaurée.");
  };

  const handleDiscardDraft = () => {
    clearWizardDraft();
    clearWizardPersistedResult();
    form.reset(createEmptyDraft());
    setPendingDraft(null);
    setCurrentStepIndex(0);
    setQuestionErrors({});
    setResultState(null);
    setLastSavedAt(null);
    toast.success("La sauvegarde locale a été effacée.");
  };

  const validateQuestionStep = () => {
    if (currentStep.kind !== "questions") return true;

    const missing = currentStep.questions.filter((question) => question.required && !answers[question.id]);

    if (!missing.length) {
      setQuestionErrors({});
      return true;
    }

    const nextErrors = Object.fromEntries(
      missing.map((question) => [question.id, "Veuillez sélectionner une réponse pour continuer."])
    );
    setQuestionErrors(nextErrors);
    toast.error("Il manque quelques réponses avant de passer à l'étape suivante.");
    return false;
  };

  const handleNext = async () => {
    if (currentStep.kind === "questions") {
      if (!validateQuestionStep()) return;
      goToStep(Math.min(currentStepIndex + 1, steps.length - 1));
      return;
    }

    const valid = await form.trigger(["contactName", "companyName", "email", "phone", "consentMarketing"]);
    if (!valid) {
      toast.error("Veuillez corriger les champs de coordonnées.");
      return;
    }

    void onSubmit(form.getValues());
  };

  const onSubmit = async (values: WizardFormValues) => {
    const requiredIds = getRequiredQuestionIds(wizard);
    const missingRequired = requiredIds.filter((id) => !values.answers?.[id]);

    if (missingRequired.length) {
      const firstMissing = missingRequired[0];
      const targetStep = sectionSteps.findIndex((step) =>
        step.questions.some((question) => question.id === firstMissing)
      );
      setQuestionErrors({ [firstMissing]: "Veuillez répondre à cette question." });
      if (targetStep >= 0) {
        goToStep(targetStep);
      }
      toast.error("Le questionnaire doit être complété avant de générer le rapport.");
      return;
    }

    setIsSubmitting(true);

    const leadCapture: LeadCaptureInput = {
      contactName: values.contactName,
      companyName: values.companyName,
      email: values.email,
      phone: values.phone ?? "",
      consentMarketing: values.consentMarketing ?? false
    };

    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          leadCapture,
          answers: values.answers
        })
      });

      const payload = (await response.json()) as AssessmentApiResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Impossible de générer le rapport pour le moment.");
      }

      const nextResultState: WizardResultState = {
        ...payload,
        leadCapture,
        answers: values.answers
      };

      clearWizardDraft();
      saveWizardPersistedResult(nextResultState);
      setResultState(nextResultState);
      trackMetaLead({
        content_name: "Auto-evaluation Loi 25",
        content_category: "Diagnostic gratuit",
        source: "wizard"
      });
      trackGoogleAdsLead({
        transaction_id: nextResultState.assessmentId
      });
      setLastSavedAt(null);
      toast.success("Résumé gratuit généré avec succès.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
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

  const handleRestart = () => {
    clearWizardDraft();
    clearWizardPersistedResult();
    form.reset(createEmptyDraft());
    setQuestionErrors({});
    setCurrentStepIndex(0);
    setResultState(null);
    setPendingDraft(null);
    setLastSavedAt(null);
    toast.success("L’assistant a été remis à zéro.");
  };

  const handleEditResult = () => {
    clearWizardPersistedResult();
    setResultState(null);
    setLastSavedAt(null);
    toast.success("Vous pouvez ajuster vos réponses et régénérer le résumé.");
  };

  if (resultState) {
    return (
      <LiteResultView
        leadCapture={resultState.leadCapture}
        scoreResult={resultState.scoreResult}
        liteReport={resultState.liteReport}
        assessmentId={resultState.assessmentId}
        accessToken={resultState.accessToken}
        paymentStatus={resultState.paymentStatus}
        priceLabel={reportUnlockPriceLabel}
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
              <Progress value={completionPercent} aria-label="Progression du questionnaire" />
              <p className="text-sm text-muted-foreground">{completionPercent}% complété</p>
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
                    Une progression locale a été trouvée dans ce navigateur. Vous pouvez reprendre là où vous étiez ou
                    repartir à neuf.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" onClick={handleRestoreDraft}>
                    Reprendre ma progression
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleDiscardDraft}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Recommencer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <CardContent className="space-y-6 p-8">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">{currentStep.kind === "questions" ? "Questionnaire" : "Coordonnées"}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Diagnostic, pas avis juridique
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{currentStep.title}</h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  {currentStep.description || "Répondez avec franchise pour obtenir un portrait plus utile."}
                </p>
              </div>
              <div className="rounded-[24px] border border-border/70 bg-muted/30 p-5 text-sm leading-7 text-muted-foreground">
                Vos réponses sont gardées localement dans ce navigateur pendant votre progression et expirent
                automatiquement après 30 jours. Votre brouillon est enregistré sur cet appareil. Si vous effacez les
                données du site, il sera perdu.
              </div>
            </CardContent>
          </Card>

          {currentStep.kind === "questions" ? (
            <div className="space-y-5">
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
          ) : (
            <Card>
              <CardContent className="space-y-5 p-8">
                {wizard.leadCapture.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input id={field.id} type={field.type} {...form.register(field.id)} />
                    {form.formState.errors[field.id] ? (
                      <p className="text-sm text-destructive">{form.formState.errors[field.id]?.message}</p>
                    ) : null}
                  </div>
                ))}

                <div className="flex items-start gap-3 rounded-[24px] border border-border/80 bg-muted/40 p-4">
                  <Controller
                    control={form.control}
                    name="consentMarketing"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        aria-label={wizard.leadCapture.consent.label}
                      />
                    )}
                  />
                  <Label className="leading-6 text-muted-foreground">{wizard.leadCapture.consent.label}</Label>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  En soumettant, vous confirmez avoir lu la politique de confidentialité et vous pouvez exercer vos
                  droits via la page Demande confidentialité.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Étape {currentStepIndex + 1} sur {steps.length}
              </p>
              <p className="text-xs text-muted-foreground/80">
                Dernière sauvegarde: {lastSavedAt ? formatLastSaved(lastSavedAt) : "pas encore"}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {currentStepIndex > 0 ? (
                <Button type="button" variant="secondary" onClick={() => goToStep(currentStepIndex - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              ) : null}

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  saveDraftSnapshot();
                  toast.success("Brouillon enregistré localement.");
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>

              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                {currentStep.kind === "lead" ? (
                  isSubmitting ? (
                    "Génération..."
                  ) : (
                    "Voir mon résumé gratuit"
                  )
                ) : (
                  <>
                    Continuer
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
