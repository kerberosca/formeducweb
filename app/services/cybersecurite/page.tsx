import type { Metadata } from "next";

import { ServicePageTemplate } from "@/components/marketing/service-page-template";
import { serviceDetails } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Réduisez les risques avec des actions concrètes: accès, MFA, sauvegardes, mises à jour et hygiène opérationnelle.";

export const metadata: Metadata = {
  title: "Audit cybersécurité et réseau PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/services/cybersecurite")
  },
  openGraph: {
    title: "Audit cybersécurité et réseau PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/services/cybersecurite")
  }
};

export default function CybersecuriteServicePage() {
  return <ServicePageTemplate {...serviceDetails.cybersecurite} />;
}
