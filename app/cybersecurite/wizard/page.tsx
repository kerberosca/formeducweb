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

export default async function CybersecurityWizardPage({
  searchParams
}: {
  searchParams?: Promise<{
    entitlement?: string | string[];
    offer?: string | string[];
  }>;
}) {
  const resolved = await searchParams;
  const entitlement = Array.isArray(resolved?.entitlement)
    ? resolved.entitlement[0]
    : resolved?.entitlement;
  const offer = Array.isArray(resolved?.offer)
    ? resolved.offer[0]
    : resolved?.offer;
  return (
    <WizardPageShell
      assessmentType="cybersecurity"
      entitlementToken={entitlement}
      preferredOffer={offer === "trio" ? "trio" : undefined}
    />
  );
}
