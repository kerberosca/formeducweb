import type { Metadata } from "next";
import { BrainCircuit, Network, ShieldCheck } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceCard } from "@/components/marketing/service-card";
import { diagnosticList } from "@/lib/diagnostics";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Diagnostics Loi 25, cybersécurité et IA pour PME au Québec. Obtenez un score, des priorités et un plan d'action.";

const iconByType = {
  loi25: ShieldCheck,
  cybersecurity: Network,
  ai: BrainCircuit
};

export const metadata: Metadata = {
  title: "Diagnostics Loi 25, cybersécurité et IA pour PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/services")
  },
  openGraph: {
    title: "Diagnostics Loi 25, cybersécurité et IA pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/services")
  }
};

export default function ServicesPage() {
  return (
    <section className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Services"
        title="Trois diagnostics pour structurer vos priorités numériques"
        description="Chaque parcours vous donne un résumé gratuit, puis un rapport complet optionnel si vous voulez aller plus loin."
        titleLevel="h1"
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {diagnosticList.map((diagnostic) => (
          <ServiceCard
            key={diagnostic.type}
            title={diagnostic.label}
            description={diagnostic.content.description}
            href={diagnostic.path}
            icon={iconByType[diagnostic.type]}
          />
        ))}
      </div>
    </section>
  );
}
