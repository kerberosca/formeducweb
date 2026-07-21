import type { Metadata } from "next";

import { WizardPageShell } from "@/components/wizard/wizard-page-shell";
import { buildPageMetadata } from "@/lib/seo";

const pageDescription =
  "Auto-évaluation cybersécurité gratuite pour PME: accès, MFA, sauvegardes, courriels, incidents et plan d'action.";

export const metadata: Metadata = buildPageMetadata({
  title: "Auto-évaluation cybersécurité gratuite pour PME",
  description: pageDescription,
  path: "/cybersecurite/wizard"
});

export default function CybersecurityWizardPage() {
  return <WizardPageShell assessmentType="cybersecurity" />;
}
