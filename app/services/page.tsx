import type { Metadata } from "next";

import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceCard } from "@/components/marketing/service-card";
import { servicesOverview } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Sites web, SEO et cybersécurité pragmatique pour PME au Québec. Alignez présence en ligne et bonnes pratiques.";

export const metadata: Metadata = {
  title: "Services web, SEO et cybersécurité pour PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/services")
  },
  openGraph: {
    title: "Services web, SEO et cybersécurité pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/services")
  }
};

export default function ServicesPage() {
  return (
    <section className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Services"
        title="Sites web, SEO et cybersécurité légère"
        description="Trois lignes de service complémentaires pour mieux aligner votre présence numérique et vos pratiques."
        titleLevel="h1"
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {servicesOverview.map((item) => (
          <ServiceCard
            key={item.slug}
            title={item.title}
            description={item.summary}
            href={`/services/${item.slug}`}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}
