"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { CourseCard } from "@/components/learning/course-card";
import type { PublicCourseSummary } from "@/components/lms/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trainingLevels, trainingOffers, trainingThemes } from "@/lib/training";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-CA")
    .trim();
}

function normalizeLevel(value: string) {
  return (
    {
      debutant: "beginner",
      intermediaire: "intermediate",
      avance: "advanced",
      entreprise: "enterprise",
      personnalise: "custom"
    }[value] ?? value
  );
}

const selectClassName =
  "h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function CourseCatalog({
  courses
}: {
  courses: readonly PublicCourseSummary[];
}) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [offer, setOffer] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return courses.filter((course) => {
      if (theme !== "all" && course.theme !== theme) return false;
      if (level !== "all" && normalizeLevel(course.level) !== level)
        return false;
      if (offer !== "all" && course.offer !== offer) return false;

      if (!normalizedQuery) return true;

      const searchableText = normalizeSearch(
        [
          course.title,
          course.description,
          course.audience,
          ...course.outcomes
        ].join(" ")
      );

      return searchableText.includes(normalizedQuery);
    });
  }, [courses, level, offer, query, theme]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    theme !== "all" ||
    level !== "all" ||
    offer !== "all";

  function resetFilters() {
    setQuery("");
    setTheme("all");
    setLevel("all");
    setOffer("all");
  }

  return (
    <div>
      <form
        role="search"
        aria-label="Filtrer le catalogue de formations"
        className="rounded-[28px] border border-border/70 bg-white/85 p-5 shadow-sm md:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          />
          <h2 className="font-heading text-xl font-semibold">
            Trouver la bonne formation
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <label
              htmlFor="formation-recherche"
              className="mb-2 block text-sm font-medium"
            >
              Mot-clé
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="formation-recherche"
                type="search"
                value={query}
                placeholder="Ex. Excel, mot de passe, IA…"
                className="pl-11"
                aria-controls="resultats-formations"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="formation-theme"
              className="mb-2 block text-sm font-medium"
            >
              Sujet
            </label>
            <select
              id="formation-theme"
              className={selectClassName}
              value={theme}
              aria-controls="resultats-formations"
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="all">Tous les sujets</option>
              {trainingThemes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="formation-niveau"
              className="mb-2 block text-sm font-medium"
            >
              Niveau
            </label>
            <select
              id="formation-niveau"
              className={selectClassName}
              value={level}
              aria-controls="resultats-formations"
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="all">Tous les niveaux</option>
              {trainingLevels
                .filter((option) => option.value !== "all")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              <option value="advanced">Avancé</option>
              <option value="enterprise">Entreprise</option>
              <option value="custom">Sur mesure</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="formation-acces"
              className="mb-2 block text-sm font-medium"
            >
              Accès
            </label>
            <select
              id="formation-acces"
              className={selectClassName}
              value={offer}
              aria-controls="resultats-formations"
              onChange={(event) => setOffer(event.target.value)}
            >
              <option value="all">Tous les accès</option>
              {trainingOffers.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filteredCourses.length} formation
            {filteredCourses.length === 1 ? "" : "s"} trouvée
            {filteredCourses.length === 1 ? "" : "s"}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              <X className="mr-2 h-4 w-4" aria-hidden="true" />
              Effacer les filtres
            </Button>
          ) : null}
        </div>
      </form>

      <div
        id="resultats-formations"
        className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {filteredCourses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-dashed border-border bg-white/70 p-8 text-center">
          <h2 className="font-heading text-2xl font-semibold">
            Aucune formation ne correspond à ces filtres
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Essayez un autre mot-clé ou revenez au catalogue complet.
            ForméducWeb peut aussi préparer une formation adaptée à votre
            environnement.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={resetFilters}
          >
            Voir toutes les formations
          </Button>
        </div>
      ) : null}
    </div>
  );
}
