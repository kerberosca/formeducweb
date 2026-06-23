import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Diagnostic Loi 25 pour PME du Québec: score de préparation, priorités et auto-évaluation gratuite pour avancer clairement.";

export const metadata: Metadata = {
  title: "Diagnostic Loi 25 pour PME du Québec | Auto-évaluation gratuite",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/loi-25")
  },
  openGraph: {
    title: "Diagnostic Loi 25 pour PME du Québec | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/loi-25")
  }
};

export default function Loi25Page() {
  return <DiagnosticLandingPage assessmentType="loi25" />;
}
