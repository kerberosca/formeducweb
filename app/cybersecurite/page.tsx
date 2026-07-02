import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Diagnostic cybersécurité pour PME: améliorez votre hygiène informatique avec MFA, sauvegardes, accès, courriels et incidents.";

export const metadata: Metadata = {
  title: "Diagnostic cybersécurité PME | Hygiène informatique",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/cybersecurite")
  },
  openGraph: {
    title: "Diagnostic cybersécurité PME | Hygiène informatique | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/cybersecurite")
  }
};

export default function CybersecurityPage() {
  return <DiagnosticLandingPage assessmentType="cybersecurity" />;
}
