import { AssessmentWizard } from "@/components/wizard/assessment-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import { getWizardData } from "@/lib/wizard";

export default function WizardPage() {
  const wizard = getWizardData();

  return (
    <>
      <section className="container pt-12">
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
