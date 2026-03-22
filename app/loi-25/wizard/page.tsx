import type { Metadata } from "next";

import { AssessmentWizard } from "@/components/wizard/assessment-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import { getAbsoluteUrl } from "@/lib/seo";
import { getWizardData } from "@/lib/wizard";

const pageDescription =
  "Faites votre auto-évaluation Loi 25 en quelques minutes. Score, priorités et plan 30 jours. Rapport complet disponible après déblocage.";

export const metadata: Metadata = {
  title: "Auto-évaluation Loi 25 pour PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/loi-25/wizard")
  },
  openGraph: {
    title: "Auto-évaluation Loi 25 pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/loi-25/wizard")
  }
};

export default function WizardPage() {
  const wizard = getWizardData();

  return (
    <>
      <section className="container border-b border-border/60 pb-8 pt-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Assistant d’auto-évaluation Loi 25
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
          Répondez aux questions pour obtenir un score, des priorités et un plan d’action. Le rapport détaillé est
          disponible après déblocage.
        </p>
      </section>
      <section className="container pt-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
            {wizard.disclaimer} Le questionnaire contient 27 questions au total : 3 questions de profil et 24 questions
            scorées regroupées par sections A à F.
          </CardContent>
        </Card>
      </section>
      <AssessmentWizard wizard={wizard} reportUnlockPriceLabel={getReportUnlockPriceLabel()} />
    </>
  );
}
