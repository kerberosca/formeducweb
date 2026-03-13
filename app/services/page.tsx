import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceCard } from "@/components/marketing/service-card";
import { servicesOverview } from "@/lib/content";

export default function ServicesPage() {
  return (
    <section className="container py-16 md:py-24">
      <SectionHeading
        eyebrow="Services"
        title="Sites web, SEO et cybersécurité légère"
        description="Trois lignes de service complémentaires pour mieux aligner votre présence numérique et vos pratiques."
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

