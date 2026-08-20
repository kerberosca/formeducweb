import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  Megaphone,
  Printer
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Étude de cas factuelle de la démonstration Escadron 839 : site public, annonces, activités, calendrier annuel et version imprimable.";

const publicFeatures = [
  {
    icon: Megaphone,
    title: "Communications centralisées",
    description:
      "Une page publique réunit les annonces importantes, les nouvelles et les activités à venir."
  },
  {
    icon: CalendarDays,
    title: "Calendrier annuel",
    description:
      "Les activités publiées sont organisées par date et les activités annulées demeurent identifiables."
  },
  {
    icon: Printer,
    title: "Consultation et impression",
    description:
      "Le calendrier peut être consulté en ligne ou ouvert dans une présentation prévue pour l’impression."
  },
  {
    icon: Eye,
    title: "Repères d’accessibilité",
    description:
      "La démonstration inclut un lien d’évitement, des textes alternatifs, des régions sémantiques et des éléments de calendrier accessibles au clavier."
  }
];

export const metadata: Metadata = buildPageMetadata({
  title: "Escadron 839 | Étude de cas web",
  description: pageDescription,
  path: "/realisations/escadron-839"
});

export default function Escadron839CaseStudyPage() {
  const caseStudySchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "Démonstration web de l’Escadron 839",
    description: pageDescription,
    url: getAbsoluteUrl("/realisations/escadron-839"),
    inLanguage: "fr-CA",
    creator: {
      "@type": "Organization",
      name: "ForméducWeb",
      url: getAbsoluteUrl("/")
    },
    about: ["Site web", "Communications", "Calendrier public"]
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
        name: "Réalisations",
        item: getAbsoluteUrl("/realisations")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Escadron 839",
        item: getAbsoluteUrl("/realisations/escadron-839")
      }
    ]
  };

  return (
    <>
      <JsonLd id="escadron-839-case-schema" value={caseStudySchema} />
      <JsonLd id="escadron-839-breadcrumb-schema" value={breadcrumbSchema} />

      <section className="container py-14 md:py-20">
        <nav aria-label="Fil d’Ariane">
          <Button asChild variant="link">
            <Link href="/realisations">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Retour aux réalisations
            </Link>
          </Button>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Étude de cas</Badge>
              <Badge>Démonstration fonctionnelle</Badge>
            </div>
            <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Escadron 839 : un site public qui rassemble information et
              calendrier.
            </h1>
            <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
              Cet exemple montre comment une présence web peut réunir une
              identité forte, des contenus pour les familles et des informations
              qui évoluent au fil de l’année.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="https://escadron839.ca">
                  Voir le site public
                  <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?source=cas-escadron-839">
                  Discuter d’un projet semblable
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[40px] border border-border/70 shadow-halo">
            <Image
              src="/realisations/escadron-839/survie-photo-retouchee.png"
              alt="Des cadets de l’Escadron 839 réunis sous un abri de survie en forêt."
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Le besoin illustré</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Une seule expérience publique doit présenter l’escadron tout en
                donnant accès aux communications et aux dates utiles.
              </p>
              <p>
                Le contenu s’adresse notamment aux jeunes, aux parents et aux
                personnes qui veulent comprendre les activités avant de
                s’inscrire.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ce qui est réellement présent</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-muted-foreground sm:grid-cols-2">
              {[
                "Une page d’accueil éditoriale avec photos et appels à l’action.",
                "Une liste des prochaines activités.",
                "Des annonces publiques, dont les messages importants.",
                "Un calendrier annuel avec catégories et états d’annulation.",
                "Une présentation prévue pour l’impression.",
                "Des liens vers l’inscription et les sources officielles."
              ].map((item) => (
                <p key={item} className="flex gap-3">
                  <CheckCircle2
                    className="mt-1 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Expérience publique"
          title="Quatre capacités visibles dans la démonstration"
          description="Chaque élément ci-dessous peut être consulté directement dans le site de démonstration."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {publicFeatures.map((feature) => (
            <Card key={feature.title} className="h-full">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Direction visuelle"
          title="Des images et une identité adaptées au milieu"
          description="La démonstration ne reprend pas l’apparence de ForméducWeb. Elle possède sa propre palette, son propre logo, ses photos et un ton conçu pour son public."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <figure className="overflow-hidden rounded-[32px] border border-border/70 bg-card">
            <div className="relative aspect-[3/2]">
              <Image
                src="/realisations/escadron-839/parade-archives.jpg"
                alt="Des membres de l’Escadron 839 participent à une parade sur un aérodrome."
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="p-5 text-sm leading-7 text-muted-foreground">
              Les images servent à raconter la tradition, le territoire et la
              vie de l’escadron.
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-[32px] border border-border/70 bg-card">
            <div className="relative aspect-[3/2]">
              <Image
                src="/realisations/escadron-839/tir-precision-original.png"
                alt="Équipement utilisé lors d’une activité encadrée de tir de précision."
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="p-5 text-sm leading-7 text-muted-foreground">
              Les contenus présentent plusieurs dimensions du programme sans
              réduire le site à une simple liste de dates.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <Card className="border-orange-200 bg-orange-50/70">
          <CardContent className="grid gap-7 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-800">
                Transparence
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                Cette étude de cas décrit le produit, pas des résultats
                inventés.
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                Aucune statistique de fréquentation, de conversion ou de
                satisfaction n’est avancée. La preuve présentée est la
                démonstration fonctionnelle elle-même et les capacités qu’elle
                permet de vérifier.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="https://escadron839.ca">
                Ouvrir le site de l’Escadron 839
                <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="container py-12 md:py-20">
        <div className="rounded-[36px] border border-primary/20 bg-primary/5 p-8 md:p-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="eyebrow">Votre contexte</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Un bon site commence par l’information qu’il doit rendre utile.
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                Présentez-nous vos publics, vos contenus et les tâches que le
                site doit simplifier. Nous pourrons clarifier une première étape
                adaptée.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/contact?source=cas-escadron-839-cta">
                Parler de votre besoin
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
