import type { Metadata } from "next";

import { WizardPageShell } from "@/components/wizard/wizard-page-shell";
import { buildPageMetadata } from "@/lib/seo";

const pageDescription =
  "Auto-évaluation IA gratuite pour PME: cas d'usage, données, gouvernance, outils, formation et plan d'action.";

export const metadata: Metadata = buildPageMetadata({
  title: "Auto-évaluation IA gratuite pour PME",
  description: pageDescription,
  path: "/intelligence-artificielle/wizard"
});

export default function AiWizardPage() {
  return <WizardPageShell assessmentType="ai" />;
}
