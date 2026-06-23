import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Diagnostic IA pour PME: cas d'usage, données, gouvernance, outils, formation et plan d'action priorisé.";

export const metadata: Metadata = {
  title: "Diagnostic IA pour PME | Auto-évaluation gratuite",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/intelligence-artificielle")
  },
  openGraph: {
    title: "Diagnostic IA pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/intelligence-artificielle")
  }
};

export default function AiPage() {
  return <DiagnosticLandingPage assessmentType="ai" />;
}
