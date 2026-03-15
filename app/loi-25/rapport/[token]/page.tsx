import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LiteResultView } from "@/components/wizard/lite-result-view";
import { ReportView } from "@/components/wizard/report-view";
import { Card, CardContent } from "@/components/ui/card";
import { findAssessmentByToken, hydrateAssessment } from "@/lib/assessment-store";
import { getReportUnlockPriceLabel } from "@/lib/payments";

type ReportAccessPageProps = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ cancel?: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default async function ReportAccessPage({ params, searchParams }: ReportAccessPageProps) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;
  const assessment = await findAssessmentByToken(token);

  if (!assessment) {
    notFound();
  }

  const hydrated = hydrateAssessment(assessment);
  const leadCapture = {
    contactName: assessment.contactName,
    companyName: assessment.companyName,
    email: assessment.email,
    phone: assessment.phone || "",
    consentMarketing: assessment.consentMarketing
  };

  return (
    <>
      {resolvedSearchParams?.cancel === "1" ? (
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
          leadCapture={leadCapture}
          scoreResult={hydrated.scoreResult}
          report={hydrated.fullReport}
          accessToken={assessment.accessToken}
        />
      ) : (
        <LiteResultView
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
