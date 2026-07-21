import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { buildPageMetadata } from "@/lib/seo";

const pageDescription =
  "Diagnostic cybersécurité pour PME: améliorez votre hygiène informatique avec MFA, sauvegardes, accès, courriels et incidents.";

export const metadata: Metadata = buildPageMetadata({
  title: "Diagnostic cybersécurité PME | Hygiène informatique",
  description: pageDescription,
  path: "/cybersecurite"
});

export default function CybersecurityPage() {
  return <DiagnosticLandingPage assessmentType="cybersecurity" />;
}
