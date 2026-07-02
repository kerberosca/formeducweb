import type { Metadata } from "next";

import { DiagnosticLandingPage } from "@/components/diagnostics/diagnostic-landing-page";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Diagnostic Loi 25 pour PME du Québec: transformez la conformité en hygiène des données, confiance client et plan d'action clair.";

export const metadata: Metadata = {
  title: "Diagnostic Loi 25 PME | Hygiène des données et confiance",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/loi-25")
  },
  openGraph: {
    title: "Diagnostic Loi 25 PME | Hygiène des données et confiance | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/loi-25")
  }
};

export default function Loi25Page() {
  return <DiagnosticLandingPage assessmentType="loi25" />;
}
