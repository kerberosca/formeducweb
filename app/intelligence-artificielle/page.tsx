import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { buildPageMetadata } from "@/lib/seo";

const pageDescription =
  "Diagnostic IA pour PME: adoptez l'intelligence artificielle avec une bonne hygiène des données, des usages et de la validation humaine.";

export const metadata: Metadata = buildPageMetadata({
  title: "Diagnostic IA PME | Hygiène IA et usages responsables",
  description: pageDescription,
  path: "/intelligence-artificielle"
});

export default function AiPage() {
  return <DiagnosticLandingPage assessmentType="ai" />;
}
