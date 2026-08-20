import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDollarSign,
  Compass,
  Layers3
} from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getServiceBySlug,
  serviceCostPrinciples,
  type ServiceDefinition
} from "@/lib/services";
import { getAbsoluteUrl } from "@/lib/seo";

type ServiceDetailPageProps = {
  service: ServiceDefinition;
};

export function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  const Icon = service.icon;
  const contactHref = `/contact?source=appel-service-${service.slug}`;
  const relatedServices = service.related.map((slug) => getServiceBySlug(slug));
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.shortTitle,
    description: service.summary,
    url: getAbsoluteUrl(service.href),
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Québec"
    },
    provider: {
      "@type": "Organization",
      name: "ForméducWeb",
      url: getAbsoluteUrl("/")
    }
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: getAbsoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: getAbsoluteUrl("/services")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.shortTitle,
        item: getAbsoluteUrl(service.href)
      }
    ]
  };

  return (
    <>
      <JsonLd id={`service-${service.slug}-schema`} value={serviceSchema} />
      <JsonLd
        id={`service-${service.slug}-breadcrumb-schema`}
        value={breadcrumbSchema}
      />

      <article>
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(circle_at_center,rgba(21,113,212,0.16),transparent_68%)]"
          />
          <div className="container py-10 md:py-16 lg:py-20">
            <nav aria-label="Fil d’Ariane" className="mb-10">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/"
                    className="rounded-sm underline-offset-4 hover:text-primary hover:underline"
                  >
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/services"
                    className="rounded-sm underline-offset-4 hover:text-primary hover:underline"
                  >
                    Services
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-medium text-foreground">
                  {service.shortTitle}
                </li>
              </ol>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="space-y-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-halo">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <Badge variant="secondary">{service.eyebrow}</Badge>
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    {service.title}
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl md:leading-9">
                    {service.intro}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href={contactHref}>
                      Décrire mon besoin
                      <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/services">
                      <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                      Voir tous les services
                    </Link>
                  </Button>
                </div>
              </div>

              <Card className="surface-grid overflow-hidden border-primary/20 bg-white/90">
                <CardContent className="p-7 md:p-9">
                  <p className="eyebrow">Résultats recherchés</p>
                  <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight">
                    Ce qui doit changer concrètement
                  </h2>
                  <ul className="mt-7 space-y-4">
                    {service.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex gap-3 text-sm leading-7"
                      >
                        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          aria-labelledby={`${service.slug}-fit-title`}
          className="container py-14 md:py-20"
        >
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="space-y-4 lg:sticky lg:top-28">
              <p className="eyebrow">Bon point de départ</p>
              <h2
                id={`${service.slug}-fit-title`}
                className="font-heading text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Ce service est pertinent si…
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                On valide d’abord le contexte. Si un autre chemin est plus
                simple, il doit apparaître avant de définir un mandat.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {service.fit.map((item, index) => (
                <Card key={item} className="h-full bg-white/80">
                  <CardContent className="space-y-4 p-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="leading-7">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby={`${service.slug}-scope-title`}
          className="border-y border-border/60 bg-white/55"
        >
          <div className="container py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Layers3 aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="eyebrow">Périmètre possible</p>
                <h2
                  id={`${service.slug}-scope-title`}
                  className="font-heading text-3xl font-semibold tracking-tight md:text-4xl"
                >
                  Ce qu’on peut prendre en charge
                </h2>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                  Le bon périmètre dépend de votre point de départ. Ces éléments
                  peuvent être combinés ou réalisés par étapes.
                </p>
              </div>

              <ul className="grid gap-3">
                {service.scope.map((item) => (
                  <li
                    key={item}
                    className="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-5 leading-7"
                  >
                    <Compass
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          aria-labelledby={`${service.slug}-process-title`}
          className="container py-14 md:py-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Démarche</p>
            <h2
              id={`${service.slug}-process-title`}
              className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl"
            >
              Avancer sans sauter les étapes utiles
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Chaque étape produit une décision ou un résultat vérifiable avant
              de poursuivre.
            </p>
          </div>

          <ol className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {service.process.map((step, index) => (
              <li key={step.title} className="relative h-full">
                <Card className="h-full bg-white/80">
                  <CardContent className="p-6">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Étape
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby={`${service.slug}-cost-title`}
          className="container py-6 md:py-10"
        >
          <div className="overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,rgba(8,45,92,0.99),rgba(21,113,212,0.96))] text-white shadow-halo">
            <div className="grid gap-9 p-8 md:p-10 lg:grid-cols-[0.86fr_1.14fr] lg:p-12">
              <div className="space-y-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <CircleDollarSign aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/65">
                  Coûts raisonnables
                </p>
                <h2
                  id={`${service.slug}-cost-title`}
                  className="font-heading text-3xl font-semibold tracking-tight md:text-4xl"
                >
                  Le coût suit le besoin, pas l’inverse
                </h2>
                <p className="text-lg leading-8 text-white/80">
                  {service.costNote}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm md:p-8">
                <ul className="space-y-4">
                  {serviceCostPrinciples.map((principle) => (
                    <li
                      key={principle}
                      className="flex gap-3 leading-7 text-white/90"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-1 h-5 w-5 shrink-0 text-orange-200"
                      />
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="mt-7 border-white/20 bg-white text-primary hover:bg-white/90"
                >
                  <Link href={`/contact?source=appel-cout-${service.slug}`}>
                    Cadrer le besoin ensemble
                    <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby={`${service.slug}-related-title`}
          className="container py-14 md:py-20"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Services complémentaires</p>
              <h2
                id={`${service.slug}-related-title`}
                className="mt-3 font-heading text-3xl font-semibold tracking-tight"
              >
                Relier les bons morceaux
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
            >
              Explorer les sept services
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {relatedServices.map((related) => {
              const RelatedIcon = related.icon;

              return (
                <Link
                  key={related.slug}
                  href={related.href}
                  className="group rounded-[28px] border border-border/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-primary/35"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <RelatedIcon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-semibold">
                    {related.shortTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {related.summary}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Voir ce service
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="container pb-16 md:pb-24">
          <div className="grid gap-7 rounded-[36px] border border-primary/20 bg-primary/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="eyebrow">Prochaine étape</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
                Partons de votre réalité actuelle
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                Décrivez le résultat recherché, les outils déjà en place et ce
                qui vous ralentit. On vous proposera une prochaine étape
                proportionnée au besoin.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href={contactHref}>
                Parler de ce besoin
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </article>
    </>
  );
}
