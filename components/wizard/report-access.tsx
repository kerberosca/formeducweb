import { notFound, redirect } from "next/navigation";

import { LiteResultView } from "@/components/wizard/lite-result-view";
import { ReportView } from "@/components/wizard/report-view";
import { Card, CardContent } from "@/components/ui/card";
import { findAssessmentByToken, hydrateAssessment } from "@/lib/assessment-store";
import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import { getReportUnlockPriceLabel } from "@/lib/payments";

type DiagnosticReportAccessProps = {
  token: string;
  cancel?: string;
  expectedType: AssessmentType;
};

export async function DiagnosticReportAccess({ token, cancel, expectedType }: DiagnosticReportAccessProps) {
  const assessment = await findAssessmentByToken(token);

  if (!assessment) {
    notFound();
  }

  const hydrated = hydrateAssessment(assessment);
  const diagnostic = getDiagnosticConfig(hydrated.assessmentType);

  if (hydrated.assessmentType !== expectedType) {
    redirect(`${diagnostic.reportPath(assessment.accessToken)}${cancel === "1" ? "?cancel=1" : ""}`);
  }

  const leadCapture = {
    contactName: assessment.contactName,
    companyName: assessment.companyName,
    email: assessment.email,
    phone: assessment.phone || "",
    consentMarketing: assessment.consentMarketing
  };

  return (
    <>
      {cancel === "1" ? (
        <section className="container pt-12">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
              Le paiement a été annulé. Votre résumé gratuit reste disponible et vous pouvez reprendre plus tard sans
              refaire le questionnaire.
            </CardContent>
          </Card>
        </section>
      ) : null}

      {assessment.paymentStatus === "paid" ? (
        <ReportView
          assessmentType={hydrated.assessmentType}
          leadCapture={leadCapture}
          scoreResult={hydrated.scoreResult}
          report={hydrated.fullReport}
          accessToken={assessment.accessToken}
        />
      ) : (
        <LiteResultView
          assessmentType={hydrated.assessmentType}
          leadCapture={leadCapture}
          scoreResult={hydrated.scoreResult}
          liteReport={hydrated.liteReport}
          assessmentId={assessment.id}
          accessToken={assessment.accessToken}
          paymentStatus={assessment.paymentStatus as "unpaid" | "refunded"}
          priceLabel={getReportUnlockPriceLabel()}
        />
      )}
    </>
  );
}
