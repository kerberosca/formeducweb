import type { Metadata } from "next";

import { WizardPageShell } from "@/components/wizard/wizard-page-shell";
import { buildPageMetadata } from "@/lib/seo";

const pageDescription =
  "Auto-évaluation Loi 25 gratuite pour PME au Québec: score, priorités et plan d'action 30 jours en quelques minutes.";

export const metadata: Metadata = buildPageMetadata({
  title: "Auto-évaluation Loi 25 gratuite pour PME",
  description: pageDescription,
  path: "/loi-25/wizard"
});

export default function WizardPage() {
  return <WizardPageShell assessmentType="loi25" />;
}
