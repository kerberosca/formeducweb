import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Compass,
  PackageOpen,
  Sparkles
} from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import {
  getServiceBySlug,
  serviceCostPrinciples,
  serviceNavigation,
  services
} from "@/lib/services";

const pageDescription =
  "Services numériques abordables pour PME et organismes au Québec: sites Web, commerce électronique, automatisation et IA, soutien TI, formation, cybersécurité, solutions d’entreprise et SEO.";

const seoService = getServiceBySlug("seo");

const approachSteps = [
  {
    title: "Écouter le travail réel",
    description:
      "On part de vos objectifs, des personnes concernées et des irritants quotidiens."
  },
  {
    title: "Choisir la bonne échelle",
    description:
      "On distingue l’essentiel, les gains rapides et ce qui peut raisonnablement attendre."
  },
  {
    title: "Implanter avec vous",
    description:
      "On teste, explique les décisions et garde des points de validation concrets."
  },
  {
    title: "Vous rendre autonome",
    description:
      "On documente et forme pour que la solution reste utile après notre intervention."
  }
] as const;

const selfServiceProducts = [
  {
    title: "Diagnostic Loi 25",
    description:
      "Situez vos pratiques de gestion des renseignements personnels et repartez avec des priorités.",
    href: "/loi-25"
  },
  {
    title: "Diagnostic cybersécurité",
    description:
      "Faites le point sur les accès, sauvegardes, appareils et habitudes de votre équipe.",
    href: "/cybersecurite"
  },
  {
    title: "Diagnostic intelligence artificielle",
    description:
      "Encadrez vos cas d’usage, vos données et la validation humaine avant d’accélérer.",
    href: "/intelligence-artificielle"
  },
  {
    title: "Trio Hygiène numérique",
    description:
      "Réunissez les trois diagnostics dans un seul parcours pour avancer dans le bon ordre.",
    href: "/trio-hygiene-numerique"
  }
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "Services numériques abordables pour PME et organismes",
  description: pageDescription,
  path: "/services"
});

export default function ServicesPage() {
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services ForméducWeb",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.shortTitle,
      url: getAbsoluteUrl(service.href)
    }))
  };

  return (
    <>
      <JsonLd id="services-portal-schema" value={servicesSchema} />

      <div>
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 -z-10 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl"
          />
          <div className="container py-16 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="space-y-7">
                <Badge variant="secondary">
                  Services numériques pour PME et organismes
                </Badge>
                <div className="space-y-5">
                  <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl">
                    Faire plus avec le numérique, sans complexité ni coûts
                    inutiles.
                  </h1>
                  <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
                    ForméducWeb aide les équipes à bâtir, automatiser, sécuriser
                    et mieux utiliser leurs outils. On évalue le besoin avec
                    vous, on explique les choix et on vous laisse plus autonome.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="#services">
                      Explorer les services
                      <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/contact?source=appel-services-hub">
                      Expliquer mon besoin
                    </Link>
                  </Button>
                </div>

                <dl className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Portée
                    </dt>
                    <dd className="mt-2 font-heading text-lg font-semibold">
                      8 services principaux
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Priorité
                    </dt>
                    <dd className="mt-2 font-heading text-lg font-semibold">
                      L’essentiel d’abord
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-white/70 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Transmission
                    </dt>
                    <dd className="mt-2 font-heading text-lg font-semibold">
                      Autonomie incluse
                    </dd>
                  </div>
                </dl>
              </div>

              <Card className="surface-grid overflow-hidden border-primary/20 bg-white/90">
                <CardContent className="p-8 md:p-10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-halo">
                    <Compass aria-hidden="true" className="h-7 w-7" />
                  </span>
                  <p className="eyebrow mt-8">Un point d’entrée simple</p>
                  <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
                    Vous n’avez pas à connaître la solution avant de nous
                    parler.
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-muted-foreground">
                    Décrivez ce que vous voulez améliorer, ce qui vous ralentit
                    et les outils déjà en place. On vous aide à séparer le
                    besoin réel du bruit technologique.
                  </p>
                  <div className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-7 text-orange-950">
                    <strong className="block font-semibold">
                      Une recommandation peut aussi être de ne rien remplacer.
                    </strong>
                    Améliorer une méthode, former l’équipe ou mieux configurer
                    un outil existant suffit parfois.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="services"
          aria-labelledby="services-title"
          className="container scroll-mt-24 py-16 md:py-24"
        >
          <div className="max-w-3xl">
            <p className="eyebrow">Notre champ d’action</p>
            <h2
              id="services-title"
              className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-5xl"
            >
              Un même objectif: rendre l’informatique plus utile
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Choisissez un point de départ. Les services peuvent se combiner,
              mais chaque intervention doit rester compréhensible, mesurable et
              proportionnée à votre réalité.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {serviceNavigation.map((service, index) => {
              const Icon = service.icon;

              return (
                <Card
                  key={service.slug}
                  className={`group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/35 ${
                    index === 0 || index === 1
                      ? "xl:col-span-1 xl:bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(236,244,255,0.92))]"
                      : "bg-white/80"
                  }`}
                >
                  <CardHeader className="space-y-5 p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon aria-hidden="true" className="h-6 w-6" />
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                        {service.eyebrow}
                      </p>
                      <CardTitle className="mt-3 text-2xl">
                        {service.shortTitle}
                      </CardTitle>
                    </div>
                    <p className="text-base leading-7 text-muted-foreground">
                      {service.summary}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col p-7 pt-0">
                    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                      {service.outcomes.slice(0, 2).map((outcome) => (
                        <li key={outcome} className="flex gap-2">
                          <Check
                            aria-hidden="true"
                            className="mt-1 h-4 w-4 shrink-0 text-primary"
                          />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={service.href}
                      className="mt-7 inline-flex items-center gap-2 self-start rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Voir le service
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition group-hover:translate-x-1"
                      />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 rounded-[30px] border border-border/70 bg-white/75 p-7 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <seoService.icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                Expertise complémentaire conservée
              </p>
              <h3 className="mt-2 font-heading text-2xl font-semibold">
                {seoService.shortTitle}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {seoService.summary}
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href={seoService.href}>
                Voir le service SEO
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          aria-labelledby="approach-title"
          className="border-y border-border/60 bg-white/55"
        >
          <div className="container py-16 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div className="space-y-5 lg:sticky lg:top-28">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="eyebrow">Notre façon de travailler</p>
                <h2
                  id="approach-title"
                  className="font-heading text-3xl font-semibold tracking-tight md:text-4xl"
                >
                  Simple ne veut pas dire improvisé
                </h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  La simplicité vient d’un bon ordre de décisions, d’un
                  périmètre clair et d’un transfert réel à votre équipe.
                </p>
              </div>

              <ol className="grid gap-5 sm:grid-cols-2">
                {approachSteps.map((step, index) => (
                  <li key={step.title}>
                    <Card className="h-full bg-background/85">
                      <CardContent className="p-6">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                        <h3 className="mt-5 font-heading text-xl font-semibold">
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
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cost-title"
          className="container py-16 md:py-24"
        >
          <div className="overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,rgba(8,45,92,0.99),rgba(21,113,212,0.96))] text-white shadow-halo">
            <div className="grid gap-10 p-8 md:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
              <div className="space-y-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <CircleDollarSign aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/65">
                  Philosophie de coût
                </p>
                <h2
                  id="cost-title"
                  className="font-heading text-3xl font-semibold tracking-tight md:text-5xl"
                >
                  Payer pour un résultat utile, pas pour de la complexité
                </h2>
                <p className="text-lg leading-8 text-white/80">
                  Une estimation sérieuse dépend du contexte, des outils déjà en
                  place et du niveau d’accompagnement. On cadre ces éléments
                  avant de proposer une portée, sans inventer un forfait qui ne
                  correspond pas au besoin.
                </p>
              </div>

              <div className="rounded-[30px] border border-white/15 bg-white/10 p-7 backdrop-blur-sm md:p-9">
                <ul className="space-y-5">
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
                  className="mt-8 border-white/20 bg-white text-primary hover:bg-white/90"
                >
                  <Link href="/contact?source=appel-cout-services-hub">
                    Cadrer mon besoin
                    <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="products-title"
          className="container pb-16 md:pb-24"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Produits en libre-service</p>
              <h2
                id="products-title"
                className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Commencer par un diagnostic, à votre rythme
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Les diagnostics restent une porte d’entrée pratique pour faire
                un premier portrait. Ils sont distincts des mandats de service
                et vous pouvez commencer sans accompagnement.
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-800">
              <PackageOpen aria-hidden="true" className="h-6 w-6" />
            </span>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {selfServiceProducts.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                className="group flex h-full flex-col rounded-[28px] border border-border/70 bg-white/80 p-6 transition hover:-translate-y-1 hover:border-primary/35"
              >
                <h3 className="font-heading text-xl font-semibold">
                  {product.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {product.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Voir le produit
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="container pb-16 md:pb-24">
          <div className="grid gap-7 rounded-[36px] border border-primary/20 bg-primary/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="eyebrow">Vous hésitez?</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
                Décrivez le résultat que vous cherchez
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                Vous n’avez pas besoin de choisir une catégorie parfaite. On
                vous aidera à trouver le point de départ le plus simple.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/contact?source=appel-services-hub-final">
                Parler à ForméducWeb
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
