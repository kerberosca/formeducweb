import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { buildPageMetadata } from "@/lib/seo";

const pageDescription =
  "Diagnostic Loi 25 pour PME du Québec: transformez la conformité en hygiène des données, confiance client et plan d'action clair.";

export const metadata: Metadata = buildPageMetadata({
  title: "Diagnostic Loi 25 PME | Hygiène des données et confiance",
  description: pageDescription,
  path: "/loi-25"
});

export default function Loi25Page() {
  return <DiagnosticLandingPage assessmentType="loi25" />;
}
