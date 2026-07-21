import Link from "next/link";

import { AssessmentWizard } from "@/components/wizard/assessment-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import { getWizardData } from "@/lib/wizard";

type WizardPageShellProps = {
  assessmentType: AssessmentType;
};

export function WizardPageShell({ assessmentType }: WizardPageShellProps) {
  const diagnostic = getDiagnosticConfig(assessmentType);
  const wizard = getWizardData(assessmentType);
  const scoredQuestions = wizard.questions.filter(
    (question) => question.weight > 0
  ).length;
  const profileQuestions = wizard.questions.filter(
    (question) => question.weight === 0
  ).length;

  return (
    <>
      <section className="container border-b border-border/60 pb-8 pt-12">
        <p className="eyebrow">{diagnostic.content.eyebrow}</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Assistant d'auto-évaluation {diagnostic.label}
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
          En environ 10 minutes, obtenez sans courriel votre score, vos trois
          priorités et un plan d'action de 30 jours. Vous pourrez ensuite
          sauvegarder le résultat ou choisir le rapport complet.
        </p>
      </section>
      <section className="container pt-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
            {wizard.disclaimer} Le questionnaire contient{" "}
            {wizard.questions.length} questions au total: {profileQuestions}{" "}
            questions de contexte et {scoredQuestions} questions scorées. Vos
            réponses restent dans ce navigateur pendant 30 jours tant que vous
            ne demandez pas la sauvegarde du résultat.
          </CardContent>
        </Card>
      </section>
      <section className="container pt-6">
        <Card>
          <CardContent className="space-y-4 p-6 text-sm leading-7 text-muted-foreground">
            <p>
              Besoin d'un rappel avant de répondre ou d'un échange avec notre
              équipe sur votre contexte? Vous pouvez consulter la page du
              service ou nous écrire directement.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <Link href={diagnostic.path}>
                  Voir le service {diagnostic.label}
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link
                  href={`/contact?source=${diagnostic.leadSource}-wizard-appel`}
                >
                  Demander un appel
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      <AssessmentWizard
        assessmentType={assessmentType}
        wizard={wizard}
        reportUnlockPriceLabel={getReportUnlockPriceLabel()}
      />
    </>
  );
}
