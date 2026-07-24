import { notFound, redirect } from "next/navigation";

import { LiteResultView } from "@/components/wizard/lite-result-view";
import { ReportView } from "@/components/wizard/report-view";
import { Card, CardContent } from "@/components/ui/card";
import {
  findAssessmentByToken,
  hydrateAssessment
} from "@/lib/assessment-store";
import {
  findUpgradeOpportunity,
  hasActiveAssessmentAccess
} from "@/lib/commerce";
import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import type { SavedAssessmentState } from "@/lib/assessment-types";

type DiagnosticReportAccessProps = {
  token: string;
  cancel?: string;
  offer?: string;
  expectedType: AssessmentType;
};

export async function DiagnosticReportAccess({
  token,
  cancel,
  offer,
  expectedType
}: DiagnosticReportAccessProps) {
  const assessment = await findAssessmentByToken(token);

  if (!assessment) {
    notFound();
  }

  const hydrated = hydrateAssessment(assessment);
  const diagnostic = getDiagnosticConfig(hydrated.assessmentType);
  const hasPaidAccess = await hasActiveAssessmentAccess(assessment);
  const upgradeOpportunity = hasPaidAccess
    ? await findUpgradeOpportunity(assessment)
    : null;

  if (hydrated.assessmentType !== expectedType) {
    const query = new URLSearchParams();
    if (cancel === "1") query.set("cancel", "1");
    if (offer === "trio") query.set("offer", "trio");
    redirect(
      `${diagnostic.reportPath(assessment.accessToken)}${
        query.size ? `?${query.toString()}` : ""
      }`
    );
  }

  const leadCapture = {
    contactName: assessment.contactName || "",
    companyName: assessment.companyName || "",
    email: assessment.email,
    phone: assessment.phone || "",
    consentMarketing: assessment.consentMarketing
  };
  const savedResult: SavedAssessmentState = {
    kind: "saved",
    assessmentType: hydrated.assessmentType,
    assessmentId: assessment.id,
    accessToken: assessment.accessToken,
    paymentStatus: hasPaidAccess
      ? "paid"
      : assessment.paymentStatus === "refunded"
        ? "refunded"
        : "unpaid",
    scoreResult: hydrated.scoreResult,
    liteReport: hydrated.liteReport,
    leadCapture,
    answers: hydrated.answers
  };

  return (
    <>
      {cancel === "1" ? (
        <section className="container pt-12">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
              Le paiement a été annulé. Votre résumé gratuit reste disponible et
              vous pouvez reprendre plus tard sans refaire le questionnaire.
            </CardContent>
          </Card>
        </section>
      ) : null}

      {hasPaidAccess ? (
        <ReportView
          assessmentType={hydrated.assessmentType}
          leadCapture={leadCapture}
          scoreResult={hydrated.scoreResult}
          report={hydrated.fullReport}
          accessToken={assessment.accessToken}
          canUpgradeToTrio={Boolean(upgradeOpportunity)}
        />
      ) : (
        <LiteResultView
          resultState={savedResult}
          priceLabel={getReportUnlockPriceLabel()}
          preferredOffer={offer === "trio" ? "trio" : undefined}
        />
      )}
    </>
  );
}
