import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Diagnostic IA pour PME: adoptez l'intelligence artificielle avec une bonne hygiène des données, des usages et de la validation humaine.";

export const metadata: Metadata = {
  title: "Diagnostic IA PME | Hygiène IA et usages responsables",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/intelligence-artificielle")
  },
  openGraph: {
    title: "Diagnostic IA PME | Hygiène IA et usages responsables | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/intelligence-artificielle")
  }
};

export default function AiPage() {
  return <DiagnosticLandingPage assessmentType="ai" />;
}
