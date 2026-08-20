import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

import { SiteSearchForm } from "@/components/search/site-search-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listPublicCourses } from "@/app/formations/course-data";
import { buildPageMetadata } from "@/lib/seo";
import {
  courseSearchDocuments,
  searchSite,
  siteSearchDocuments
} from "@/lib/search";

const description =
  "Recherchez dans les formations, services, produits, guides, ressources, réalisations et questions fréquentes de ForméducWeb.";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Recherche",
    description,
    path: "/recherche",
    index: false
  }),
  robots: {
    index: false,
    follow: true
  }
};

type SearchPageProps = {
  searchParams?: Promise<{ q?: string | string[] }> | { q?: string | string[] };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (rawQuery ?? "").trim().slice(0, 160);
  const courses = query ? await listPublicCourses() : [];
  const documents = [
    ...siteSearchDocuments.filter(
      (document) => document.category !== "Formation"
    ),
    ...courseSearchDocuments(courses)
  ];
  const results = query ? searchSite(query, documents) : [];

  return (
    <section className="container py-14 md:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow">Recherche globale</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Trouver le bon point de départ
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
          Explorez tout le portail avec des mots simples : un outil, un sujet,
          une tâche à accomplir ou un problème à résoudre.
        </p>

        <div className="mt-8 rounded-[28px] border border-border/70 bg-white/80 p-4 shadow-sm md:p-5">
          <SiteSearchForm initialQuery={query} />
        </div>

        {!query ? (
          <Card className="mt-10 border-primary/20 bg-primary/5">
            <CardContent className="p-7 text-sm leading-7 text-muted-foreground">
              Essayez par exemple « Excel », « automatisation », « boutique en
              ligne », « sauvegardes » ou « Loi 25 ».
            </CardContent>
          </Card>
        ) : results.length > 0 ? (
          <section className="mt-12" aria-labelledby="search-results-title">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="search-results-title"
                className="font-heading text-2xl font-semibold"
              >
                Résultats pour « {query} »
              </h2>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {results.length} résultat{results.length > 1 ? "s" : ""}
              </p>
            </div>

            <ol className="mt-6 grid gap-4">
              {results.map((result) => (
                <li key={`${result.category}-${result.href}-${result.title}`}>
                  <article className="rounded-[26px] border border-border/70 bg-white/80 p-6 transition hover:border-primary/35 hover:shadow-sm">
                    <Badge variant="secondary">{result.category}</Badge>
                    <h3 className="mt-4 font-heading text-xl font-semibold">
                      <Link
                        href={result.href}
                        className="rounded-sm underline-offset-4 hover:text-primary hover:underline"
                      >
                        {result.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {result.description}
                    </p>
                    <Link
                      href={result.href}
                      className="mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Consulter
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <Card className="mt-10">
            <CardContent className="flex gap-4 p-7">
              <SearchX
                aria-hidden="true"
                className="mt-1 h-6 w-6 shrink-0 text-primary"
              />
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Aucun résultat pour « {query} »
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Essayez un terme plus court ou décrivez directement votre
                  besoin dans le formulaire de contact.
                </p>
                <Link
                  href="/contact?source=recherche-sans-resultat"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Parler de votre besoin
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
