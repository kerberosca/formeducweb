import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ListChecks,
  LockKeyhole,
  MonitorPlay,
  UsersRound
} from "lucide-react";

import { auth } from "@/auth";
import { enrollFreeCourseAction } from "@/app/formations/actions";
import { getPublicCourse } from "@/app/formations/course-data";
import { CourseCheckoutButton } from "@/components/lms/course-checkout-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { COURSE_FORMAT_LABELS } from "@/lib/lms/constants";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";

type CoursePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

const themeLabels: Record<string, string> = {
  internet: "Internet",
  ai: "Intelligence artificielle",
  excel: "Excel",
  word: "Word",
  cybersecurity: "Cybersécurité",
  automation: "Automatisation"
};

const levelLabels: Record<string, string> = {
  beginner: "Débutant",
  debutant: "Débutant",
  intermediate: "Intermédiaire",
  intermediaire: "Intermédiaire",
  advanced: "Avancé",
  avance: "Avancé",
  enterprise: "Entreprise",
  entreprise: "Entreprise",
  custom: "Sur mesure",
  personnalise: "Sur mesure",
  all: "Tous niveaux"
};

export async function generateMetadata({
  params
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  return course
    ? buildPageMetadata({
        title: `${course.title} — Formation`,
        description: course.description,
        path: `/formations/${course.slug}`
      })
    : {};
}

async function getAccess(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { signedIn: false, enrolled: false };
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      isActive: true,
      emailVerified: true,
      enrollments: {
        where: { courseId, status: "active", revokedAt: null },
        select: { id: true },
        take: 1
      }
    }
  });
  return {
    signedIn: Boolean(user?.isActive && user.emailVerified),
    enrolled: Boolean(user?.enrollments.length)
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getPublicCourse(slug);
  if (!course) notFound();

  const lessons = course.modules.flatMap((module) => module.lessons);
  const access = await getAccess(course.id);
  const learnHref = `/formations/${course.slug}/apprendre`;
  const loginHref = `/connexion?callbackUrl=${encodeURIComponent(learnHref)}`;
  const isFree = course.offer === "free" && (course.priceCents ?? 0) === 0;
  const isPaid = course.offer === "paid";
  const isPreparation =
    course.status === "preparation" ||
    (!course.isPurchasable && isPaid && course.slug !== "excel-essentiel");

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: getAbsoluteUrl(`/formations/${course.slug}`),
    inLanguage: "fr-CA",
    timeRequired: `PT${course.durationMinutes}M`,
    educationalLevel: levelLabels[course.level] ?? course.level,
    provider: {
      "@type": "Organization",
      name: "ForméducWeb",
      url: getAbsoluteUrl("/")
    },
    ...(!isPreparation && (isFree || course.isPurchasable)
      ? {
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            priceCurrency: course.currency.toUpperCase(),
            price: (course.priceCents ?? 0) / 100
          }
        }
      : {})
  };

  return (
    <>
      <JsonLd id={`course-${course.slug}-schema`} value={courseSchema} />
      <section className="container py-14 md:py-20">
        <nav
          aria-label="Fil d’Ariane"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/">Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link href="/formations">Formations</Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground">{course.shortTitle}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge>{themeLabels[course.theme] ?? course.theme}</Badge>
              <Badge variant="outline">
                {levelLabels[course.level] ?? course.level}
              </Badge>
              <Badge
                variant={course.offer === "custom" ? "secondary" : "outline"}
              >
                {isPreparation
                  ? "En préparation"
                  : isFree
                    ? "Gratuite"
                    : isPaid
                      ? "Payante"
                      : "Sur mesure"}
              </Badge>
            </div>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              {course.title}
            </h1>
            <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
              {course.description}
            </p>
            <dl className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                <dt className="sr-only">Durée</dt>
                <dd>{course.durationLabel}</dd>
              </div>
              <div className="flex items-center gap-2">
                <MonitorPlay
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <dt className="sr-only">Format</dt>
                <dd>
                  {COURSE_FORMAT_LABELS[
                    course.format as keyof typeof COURSE_FORMAT_LABELS
                  ] ?? course.format}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <ListChecks
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                <dt className="sr-only">Leçons</dt>
                <dd>
                  {lessons.length} leçon{lessons.length === 1 ? "" : "s"}
                </dd>
              </div>
            </dl>
          </div>

          <Card className="border-primary/20 bg-white/95 lg:sticky lg:top-28">
            <CardContent className="p-7">
              <p className="text-sm text-muted-foreground">Accès</p>
              <p className="mt-2 font-heading text-4xl font-semibold">
                {course.priceLabel}
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {isPreparation
                  ? "Le contenu Word est en préparation. Cette formation n’est pas encore achetable."
                  : course.offer === "custom"
                    ? "Le contenu et les exemples sont adaptés à votre équipe et à vos outils."
                    : "Un compte gratuit par lien courriel est requis pour apprendre et conserver votre progression."}
              </p>

              <div className="mt-6">
                {isPreparation ? (
                  <Button type="button" size="lg" className="w-full" disabled>
                    Inscription bientôt disponible
                  </Button>
                ) : course.offer === "custom" ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/contact?source=formation-${course.slug}`}>
                      Planifier cette formation
                    </Link>
                  </Button>
                ) : !access.signedIn ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={loginHref}>
                      <LockKeyhole
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      Se connecter pour continuer
                    </Link>
                  </Button>
                ) : access.enrolled ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={learnHref}>
                      Reprendre la formation
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                ) : isFree ? (
                  <form action={enrollFreeCourseAction}>
                    <input
                      type="hidden"
                      name="courseSlug"
                      value={course.slug}
                    />
                    <Button type="submit" size="lg" className="w-full">
                      S’inscrire gratuitement
                    </Button>
                  </form>
                ) : (
                  <CourseCheckoutButton courseSlug={course.slug} />
                )}
              </div>

              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link href="/formations">
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Retour au catalogue
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ce que vous saurez faire</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pour qui et préalables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
              <div className="flex gap-3">
                <UsersRound
                  className="mt-1 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p>{course.audience}</p>
              </div>
              <ul className="space-y-2 border-t border-border/70 pt-5">
                {course.prerequisites.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <p className="eyebrow">Contenu</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Le parcours, étape par étape
        </h2>
        <div className="mt-8 space-y-8">
          {course.modules.map((module) => (
            <section key={module.id} aria-labelledby={`module-${module.id}`}>
              <h3
                id={`module-${module.id}`}
                className="font-heading text-2xl font-semibold"
              >
                {module.title}
              </h3>
              {module.description ? (
                <p className="mt-2 text-muted-foreground">
                  {module.description}
                </p>
              ) : null}
              {module.lessons.length ? (
                <ol className="mt-4 grid gap-4">
                  {module.lessons.map((lesson, index) => (
                    <li key={lesson.id}>
                      <Card>
                        <CardContent className="flex gap-4 p-5 md:items-center md:p-6">
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
                            aria-hidden="true"
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-heading text-lg font-semibold">
                              {lesson.title}
                            </h4>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {lesson.summary}
                            </p>
                          </div>
                          <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                            {lesson.durationMinutes} min
                          </span>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-border bg-white/70 p-5 text-sm leading-6 text-muted-foreground">
                  Le programme détaillé sera publié lorsque le contenu sera
                  réellement prêt. Aucune inscription ni précommande n’est
                  ouverte pour le moment.
                </p>
              )}
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
