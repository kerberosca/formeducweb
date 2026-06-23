import type { Metadata } from "next";

import { WizardPageShell } from "@/components/wizard/wizard-page-shell";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Auto-évaluation IA gratuite pour PME: cas d'usage, données, gouvernance, outils, formation et plan d'action.";

export const metadata: Metadata = {
  title: "Auto-évaluation IA gratuite pour PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/intelligence-artificielle/wizard")
  },
  openGraph: {
    title: "Auto-évaluation IA gratuite pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/intelligence-artificielle/wizard")
  }
};

export default function AiWizardPage() {
  return <WizardPageShell assessmentType="ai" />;
}
