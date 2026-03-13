"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Save, ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { QuestionField } from "@/components/wizard/question-field";
import { ReportView } from "@/components/wizard/report-view";
import { WizardStepper } from "@/components/wizard/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { GeneratedReport } from "@/lib/recommendations";
import type { ScoreResult } from "@/lib/scoring";
import { assessmentAnswersSchema, leadCaptureSchema, type LeadCaptureInput } from "@/lib/schemas";
import {
  clearWizardDraft,
  createEmptyDraft,
  getCompletionPercent,
  getRequiredQuestionIds,
  getWizardSteps,
  loadWizardDraft,
  saveWizardDraft,
  type WizardDataset
} from "@/lib/wizard";

const wizardClientSchema = leadCaptureSchema.extend({
  answers: assessmentAnswersSchema
});

type WizardFormValues = z.infer<typeof wizardClientSchema>;

type AssessmentApiResponse = {
  scoreResult: ScoreResult;
  report: GeneratedReport;
  pdfUrl?: string | null;
};

type WizardResultState = AssessmentApiResponse & {
  leadCapture: LeadCaptureInput;
  answers: Record<string, string | undefined>;
};

export function AssessmentWizard({ wizard }: { wizard: WizardDataset }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [resultState, setResultState] = useState<WizardResultState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        description: "Recevez votre rapport et choisissez la suite."
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

  useEffect(() => {
    const draft = loadWizardDraft();

    if (!draft) return;

    form.reset({
      answers: draft.answers,
      contactName: draft.contactName,
      companyName: draft.companyName,
      email: draft.email,
      phone: draft.phone,
      consentMarketing: draft.consentMarketing
    });

    toast.info("Un brouillon local a été restauré.");
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      saveWizardDraft({
        answers: values.answers ?? {},
        contactName: values.contactName ?? "",
        companyName: values.companyName ?? "",
        email: values.email ?? "",
        phone: values.phone ?? "",
        consentMarketing: values.consentMarketing ?? false
      });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    toast.error("Il manque quelques réponses avant de passer à l’étape suivante.");
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
      const targetStep = sectionSteps.findIndex((step) => step.questions.some((question) => question.id === firstMissing));
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

      clearWizardDraft();
      setResultState({
        ...payload,
        leadCapture,
        answers: values.answers
      });
      toast.success("Rapport généré avec succès.");
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
    form.reset(createEmptyDraft());
    setQuestionErrors({});
    setCurrentStepIndex(0);
    setResultState(null);
    toast.success("La wizard a été remise à zéro.");
  };

  if (resultState) {
    return (
      <ReportView
        wizard={wizard}
        leadCapture={resultState.leadCapture}
        scoreResult={resultState.scoreResult}
        report={resultState.report}
        onEdit={() => setResultState(null)}
        onRestart={handleRestart}
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
                <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{currentStep.title}</h1>
                <p className="text-lg leading-8 text-muted-foreground">
                  {currentStep.description || "Répondez avec franchise pour obtenir un plan d’action plus utile."}
                </p>
              </div>
              <div className="rounded-[24px] border border-border/70 bg-muted/30 p-5 text-sm leading-7 text-muted-foreground">
                Vos réponses sont gardées localement dans ce navigateur pendant votre progression. Aucun tracker n’est
                installé par défaut.
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
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Étape {currentStepIndex + 1} sur {steps.length}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {currentStepIndex > 0 ? (
                <Button type="button" variant="secondary" onClick={() => goToStep(currentStepIndex - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              ) : null}

              <Button type="button" variant="secondary" onClick={() => toast.success("Brouillon enregistré localement.")}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>

              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                {currentStep.kind === "lead" ? (
                  isSubmitting ? (
                    "Génération..."
                  ) : (
                    "Générer mon rapport"
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


