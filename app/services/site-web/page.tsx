import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ServiceDetailPage } from "@/components/portal/service-detail-page";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";
import { getServiceBySlug } from "@/lib/services";

const service = getServiceBySlug("site-web");

export const metadata: Metadata = buildPageMetadata({
  title: service.seoTitle,
  description: service.seoDescription,
  path: service.href
});

export default function WebsiteServicePage() {
  return (
    <>
      <ServiceDetailPage service={service} />
      <section className="container pb-16 md:pb-24">
        <div className="grid gap-6 rounded-[32px] border border-primary/20 bg-primary/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="eyebrow">Une réalisation ForméducWeb</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
              L’Appel d’Onatchiway
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              ForméducWeb a conçu cette expérience sur mesure et commandite son
              hébergement. Son accès demeure privé pendant la validation avec
              le partenaire.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/demoOnatchiway">
              Voir la réalisation
              <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
