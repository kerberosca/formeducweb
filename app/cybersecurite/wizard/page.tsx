import type { Metadata } from "next";

import { WizardPageShell } from "@/components/wizard/wizard-page-shell";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Auto-évaluation cybersécurité gratuite pour PME: accès, MFA, sauvegardes, courriels, incidents et plan d'action.";

export const metadata: Metadata = {
  title: "Auto-évaluation cybersécurité gratuite pour PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/cybersecurite/wizard")
  },
  openGraph: {
    title: "Auto-évaluation cybersécurité gratuite pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/cybersecurite/wizard")
  }
};

export default function CybersecurityWizardPage() {
  return <WizardPageShell assessmentType="cybersecurity" />;
}
