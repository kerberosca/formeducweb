import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Diagnostic cybersécurité pour PME: accès, MFA, sauvegardes, courriel, incidents et plan d'action priorisé.";

export const metadata: Metadata = {
  title: "Diagnostic cybersécurité PME | Auto-évaluation gratuite",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/cybersecurite")
  },
  openGraph: {
    title: "Diagnostic cybersécurité PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/cybersecurite")
  }
};

export default function CybersecurityPage() {
  return <DiagnosticLandingPage assessmentType="cybersecurity" />;
}
