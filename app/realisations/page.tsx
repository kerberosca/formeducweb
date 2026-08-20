import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  LayoutTemplate,
  Printer,
  Sparkles
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Découvrez les réalisations et démonstrations fonctionnelles de ForméducWeb, dont le site, les communications et le calendrier public de l’Escadron 839.";

const evidencePoints = [
  {
    icon: LayoutTemplate,
    title: "Un site adapté au contexte",
    description:
      "L’identité, les contenus et les parcours sont conçus autour des personnes qui consulteront réellement le site."
  },
  {
    icon: CalendarDays,
    title: "Une information utile",
    description:
      "La démonstration réunit présentation, activités, annonces et calendrier dans une expérience publique cohérente."
  },
  {
    icon: Printer,
    title: "Plus qu’une vitrine",
    description:
      "Une version imprimable du calendrier prolonge l’outil au-delà de la navigation web."
  }
];

export const metadata: Metadata = buildPageMetadata({
  title: "Réalisations | Sites et outils numériques",
  description: pageDescription,
  path: "/realisations"
});

export default function RealizationsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Réalisations ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/realisations"),
    inLanguage: "fr-CA",
    hasPart: [
      {
        "@type": "CreativeWork",
        name: "Démonstration web de l’Escadron 839",
        url: getAbsoluteUrl("/realisations/escadron-839")
      }
    ]
  };

  return (
    <>
      <JsonLd id="realizations-collection-schema" value={collectionSchema} />

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary">Réalisations et démonstrations</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl">
                Voir ce que donne une solution pensée autour d’un besoin réel.
              </h1>
              <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
                Nous documentons les fonctionnalités qui peuvent être vérifiées,
                les choix d’expérience et les limites de chaque exemple, sans
                inventer de résultats ou de statistiques.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#escadron-839">
                  Voir la réalisation
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?source=realisations">
                  Parler de votre projet
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[40px] border border-border/70 bg-[#0d315b] shadow-halo">
            <Image
              src="/realisations/escadron-839/survie-photo-retouchee.png"
              alt="Des cadets réunis sous un abri de survie en forêt."
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082444]/95 via-[#082444]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
                Démonstration fonctionnelle
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold">
                Escadron 839
              </p>
              <p className="mt-2 text-sm text-white/80">
                Site public, communications et calendrier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Ce que nous montrons"
          title="Des preuves concrètes, présentées avec leurs limites"
          description="Une réalisation utile ne se résume pas à son apparence. Elle organise l’information, facilite une tâche et demeure compréhensible pour les personnes qui l’utilisent."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {evidencePoints.map((point) => (
            <Card key={point.title} className="h-full">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <point.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle>{point.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {point.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="escadron-839"
        className="container scroll-mt-24 py-10 md:py-16"
      >
        <Card className="overflow-hidden border-primary/20">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[340px] bg-muted">
              <Image
                src="/realisations/escadron-839/parade-archives.jpg"
                alt="Des membres de l’Escadron 839 participent à une parade sur un aérodrome."
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <CardContent className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
              <div className="flex flex-wrap gap-2">
                <Badge>Site public</Badge>
                <Badge>Calendrier</Badge>
                <Badge>Version imprimable</Badge>
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                Étude de cas
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Escadron 839 Lions de Chibougamau
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Une démonstration qui rassemble la présentation de l’escadron,
                les activités à venir, les annonces et un calendrier annuel dans
                un même environnement public en français.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/realisations/escadron-839">
                    Lire l’étude de cas
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="https://escadron839.ca">
                    Voir le site public
                    <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>

      <section className="container py-12 md:py-20">
        <div className="rounded-[36px] border border-primary/20 bg-primary/5 p-8 md:p-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-3 text-primary">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                <p className="eyebrow">Votre projet</p>
              </div>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Votre réalité demande peut-être une autre combinaison.
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                Site, contenu, automatisation, espace privé ou outil de travail
                : décrivez d’abord le besoin que vous voulez simplifier.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/contact?source=realisations-cta">
                Discuter de votre projet
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
