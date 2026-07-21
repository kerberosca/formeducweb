import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

import { FaqList } from "@/components/marketing/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAbsoluteUrl } from "@/lib/seo";
import {
  getRelatedSeoPages,
  seoThemeLabels,
  seoThemeLandingPaths,
  type SeoSupportPage
} from "@/lib/seo-content";

type SupportArticlePageProps = {
  page: SeoSupportPage;
};

export function SupportArticlePage({ page }: SupportArticlePageProps) {
  const relatedPages = getRelatedSeoPages(page);
  const pageUrl = getAbsoluteUrl(page.path);
  const themeUrl = getAbsoluteUrl(seoThemeLandingPaths[page.theme]);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.description,
    datePublished: page.updatedAt,
    dateModified: page.updatedAt,
    inLanguage: "fr-CA",
    mainEntityOfPage: pageUrl,
    author: {
      "@type": "Organization",
      name: "ForméducWeb"
    },
    publisher: {
      "@type": "Organization",
      name: "ForméducWeb"
    }
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
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
        name: seoThemeLabels[page.theme],
        item: themeUrl
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.shortTitle,
        item: pageUrl
      }
    ]
  };

  return (
    <>
      <JsonLd id={`${page.slug}-article-schema`} value={articleSchema} />
      <JsonLd id={`${page.slug}-faq-schema`} value={faqSchema} />
      <JsonLd id={`${page.slug}-breadcrumb-schema`} value={breadcrumbSchema} />

      <article className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="max-w-4xl space-y-10">
            <header className="space-y-6">
              <nav
                aria-label="Fil d'Ariane"
                className="flex flex-wrap gap-2 text-sm text-muted-foreground"
              >
                <Link href="/" className="transition hover:text-primary">
                  Accueil
                </Link>
                <span>/</span>
                <Link
                  href={seoThemeLandingPaths[page.theme]}
                  className="transition hover:text-primary"
                >
                  {seoThemeLabels[page.theme]}
                </Link>
                <span>/</span>
                <span className="text-foreground">{page.shortTitle}</span>
              </nav>
              <Badge>{page.eyebrow}</Badge>
              <div className="space-y-5">
                <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
                  {page.title}
                </h1>
                <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
                  {page.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Mis à jour le {page.updatedAt}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Lecture {page.readingTime}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {page.primaryKeyword}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={page.primaryCtaHref}>
                    {page.primaryCtaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={page.secondaryCtaHref}>
                    {page.secondaryCtaLabel}
                  </Link>
                </Button>
              </div>
            </header>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-5 p-6 md:p-8">
                <p className="text-lg leading-8 text-foreground">
                  {page.summary}
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {page.takeaways.map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 text-sm leading-7 text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-10">
              {page.sections.map((section) => (
                <section key={section.heading} className="space-y-5">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="space-y-5 text-base leading-8 text-muted-foreground">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets ? (
                    <ul className="grid gap-3 text-sm leading-7 text-muted-foreground md:grid-cols-3">
                      {section.bullets.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 rounded-2xl border border-border/70 bg-white/75 p-4"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <section className="space-y-5">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Questions fréquentes
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <FaqList items={page.faq} />
                </CardContent>
              </Card>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <Card>
              <CardHeader>
                <CardTitle>Continuer le parcours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={page.primaryCtaHref}>{page.primaryCtaLabel}</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={seoThemeLandingPaths[page.theme]}>
                    Voir le pilier {seoThemeLabels[page.theme]}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pages liées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedPages.map((relatedPage) => (
                  <Link
                    key={relatedPage.path}
                    href={relatedPage.path}
                    className="group block rounded-2xl border border-border/70 bg-white/75 p-4 transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {relatedPage.shortTitle}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {relatedPage.description}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
    </>
  );
}
