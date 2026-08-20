import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Sparkles,
  UsersRound
} from "lucide-react";

import { CourseCatalog } from "@/components/learning/course-catalog";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { listPublicCourses } from "@/app/formations/course-data";

const pageDescription =
  "Formations numériques simples et abordables en français: Internet, intelligence artificielle, Excel, Word, cybersécurité et automatisation pour particuliers, PME et OBNL.";

export const metadata: Metadata = buildPageMetadata({
  title: "Formations numériques — Internet, IA, Excel, Word et cybersécurité",
  description: pageDescription,
  path: "/formations"
});

const commitments = [
  {
    icon: BookOpenCheck,
    title: "Comprendre avant d’appliquer",
    description:
      "Des explications en langage simple, suivies de gestes concrets à essayer dans votre contexte."
  },
  {
    icon: GraduationCap,
    title: "Apprendre à votre rythme",
    description:
      "Des parcours courts et autonomes, avec une progression enregistrée dans votre compte."
  },
  {
    icon: UsersRound,
    title: "Adapter à votre équipe",
    description:
      "Une formation peut être ajustée à vos outils, vos procédures et l’arrivée de nouvelles personnes."
  }
];

export const dynamic = "force-dynamic";

export default async function TrainingCatalogPage() {
  const courses = await listPublicCourses();
  const courseListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catalogue de formations ForméducWeb",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: course.title,
      url: getAbsoluteUrl(`/formations/${course.slug}`)
    }))
  };

  return (
    <>
      <JsonLd id="training-catalog-schema" value={courseListSchema} />

      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary">Formation · Éducation · Web</Badge>
            <div className="space-y-5">
              <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl">
                Développez votre autonomie numérique, une compétence à la fois.
              </h1>
              <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
                Des formations simples, utiles et abordables pour mieux utiliser
                Internet, l’IA, Excel, Word, la cybersécurité et
                l’automatisation au quotidien.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#catalogue">Explorer les formations</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?source=formation-personnalisee">
                  Demander une formation adaptée
                </Link>
              </Button>
            </div>
          </div>

          <Card className="surface-grid overflow-hidden border-primary/20 bg-white/90">
            <CardContent className="p-7 md:p-9">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-7 w-7" aria-hidden="true" />
              </div>
              <p className="eyebrow mt-6">Un compte simple et sécuritaire</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
                Un espace pour reprendre exactement où vous étiez
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                Chaque parcours, même gratuit, demande une connexion par lien
                courriel. Votre progression et vos certificats restent ainsi
                disponibles d’un appareil à l’autre.
              </p>
              <Button asChild variant="secondary" className="mt-6">
                <Link href="#catalogue">
                  Voir les parcours gratuits
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading
          eyebrow="Notre approche"
          title="Apprendre juste ce qu’il faut, puis le mettre en pratique"
          description="Chaque formation vise un résultat concret et respecte le niveau de départ des personnes qui la suivent."
        />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {commitments.map((commitment) => (
            <Card key={commitment.title}>
              <CardContent className="p-6">
                <commitment.icon
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                />
                <h2 className="mt-4 font-heading text-xl font-semibold">
                  {commitment.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {commitment.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="catalogue" className="container scroll-mt-24 py-12 md:py-20">
        <SectionHeading
          eyebrow="Catalogue"
          title="Choisissez votre prochaine compétence"
          description="Filtrez par sujet, niveau ou type d’accès. Les parcours gratuits peuvent être commencés immédiatement."
        />
        <div className="mt-9">
          <CourseCatalog courses={courses} />
        </div>
      </section>

      <section className="container pb-20 pt-8 md:pb-28">
        <Card className="overflow-hidden border-primary bg-primary text-primary-foreground">
          <CardContent className="grid gap-6 p-8 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-heading text-3xl font-semibold">
                La formation dont votre équipe a besoin n’est pas encore ici?
              </p>
              <p className="mt-3 max-w-3xl leading-7 text-primary-foreground">
                ForméducWeb peut reprendre vos outils, vos exemples et vos
                procédures pour créer un atelier d’accueil, de perfectionnement
                ou de mise à niveau vraiment adapté à votre environnement.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact?source=formation-sur-mesure-catalogue">
                Décrire mon besoin
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
