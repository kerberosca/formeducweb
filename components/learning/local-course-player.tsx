"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Save,
  ShieldCheck
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTrainingProgressKey, type TrainingCourse } from "@/lib/training";
import { cn } from "@/lib/utils";

type StoredProgress = {
  version: 1;
  courseSlug: string;
  completedLessonIds: string[];
  lastLessonId: string;
};

function readStoredProgress(
  course: TrainingCourse,
  rawValue: string | null
): StoredProgress | null {
  if (!rawValue) return null;

  try {
    const value = JSON.parse(rawValue) as Partial<StoredProgress>;
    const lessonIds = new Set(course.lessons.map((lesson) => lesson.id));

    if (
      value.version !== 1 ||
      value.courseSlug !== course.slug ||
      !Array.isArray(value.completedLessonIds) ||
      typeof value.lastLessonId !== "string"
    ) {
      return null;
    }

    return {
      version: 1,
      courseSlug: course.slug,
      completedLessonIds: value.completedLessonIds.filter(
        (id): id is string => typeof id === "string" && lessonIds.has(id)
      ),
      lastLessonId: lessonIds.has(value.lastLessonId)
        ? value.lastLessonId
        : course.lessons[0]?.id || ""
    };
  } catch {
    return null;
  }
}

export function LocalCoursePlayer({ course }: { course: TrainingCourse }) {
  const firstLessonId = course.lessons[0]?.id || "";
  const [selectedLessonId, setSelectedLessonId] = useState(firstLessonId);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const selectedLessonIndex = Math.max(
    0,
    course.lessons.findIndex((lesson) => lesson.id === selectedLessonId)
  );
  const selectedLesson = course.lessons[selectedLessonIndex];
  const completedSet = useMemo(
    () => new Set(completedLessonIds),
    [completedLessonIds]
  );
  const completionPercentage = course.lessons.length
    ? Math.round((completedSet.size / course.lessons.length) * 100)
    : 0;
  const isComplete =
    course.lessons.length > 0 && completedSet.size === course.lessons.length;

  useEffect(() => {
    try {
      const savedProgress = readStoredProgress(
        course,
        window.localStorage.getItem(getTrainingProgressKey(course.slug))
      );

      if (savedProgress) {
        setCompletedLessonIds(savedProgress.completedLessonIds);
        setSelectedLessonId(savedProgress.lastLessonId);
      }
    } catch {
      setStorageAvailable(false);
    } finally {
      setStorageReady(true);
    }
  }, [course]);

  useEffect(() => {
    if (!storageReady || !storageAvailable) return;

    const progress: StoredProgress = {
      version: 1,
      courseSlug: course.slug,
      completedLessonIds,
      lastLessonId: selectedLessonId
    };

    try {
      window.localStorage.setItem(
        getTrainingProgressKey(course.slug),
        JSON.stringify(progress)
      );
    } catch {
      setStorageAvailable(false);
    }
  }, [
    completedLessonIds,
    course.slug,
    selectedLessonId,
    storageAvailable,
    storageReady
  ]);

  if (!selectedLesson) {
    return (
      <Card>
        <CardContent className="p-8">
          Cette formation ne contient pas encore de leçon.
        </CardContent>
      </Card>
    );
  }

  function setLessonCompletion(lessonId: string, completed: boolean) {
    setCompletedLessonIds((current) => {
      if (completed) return Array.from(new Set([...current, lessonId]));
      return current.filter((id) => id !== lessonId);
    });
    setStatusMessage(
      completed
        ? "Leçon marquée comme terminée."
        : "Leçon retirée de votre progression."
    );
  }

  function completeAndContinue() {
    setLessonCompletion(selectedLesson.id, true);
    const nextLesson = course.lessons[selectedLessonIndex + 1];

    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
      setStatusMessage(
        "Progression enregistrée sur cet appareil. Leçon suivante ouverte."
      );
    } else {
      setStatusMessage("Formation terminée. Bravo!");
    }
  }

  function resetProgress() {
    const confirmed = window.confirm(
      "Effacer la progression de cette formation sur cet appareil?"
    );
    if (!confirmed) return;

    try {
      window.localStorage.removeItem(getTrainingProgressKey(course.slug));
    } catch {
      setStorageAvailable(false);
    }

    setCompletedLessonIds([]);
    setSelectedLessonId(firstLessonId);
    setStatusMessage("Progression locale effacée.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
      <aside className="space-y-5 lg:sticky lg:top-28">
        <Card className="bg-white/90">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Votre progression</p>
              <span className="text-sm font-semibold text-primary">
                {completionPercentage} %
              </span>
            </div>
            <Progress
              value={completionPercentage}
              aria-label={`${completionPercentage} % de la formation terminée`}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              {completedSet.size} leçon{completedSet.size === 1 ? "" : "s"} sur{" "}
              {course.lessons.length}
            </p>
          </CardContent>
        </Card>

        <nav aria-label={`Leçons — ${course.shortTitle}`}>
          <ol className="space-y-2">
            {course.lessons.map((lesson, index) => {
              const completed = completedSet.has(lesson.id);
              const selected = lesson.id === selectedLesson.id;

              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    aria-current={selected ? "step" : undefined}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border/70 bg-white/75 hover:border-primary/40"
                    )}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setStatusMessage(`Leçon ${index + 1} ouverte.`);
                    }}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        completed
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                      aria-hidden="true"
                    >
                      {completed ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">
                        {lesson.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                        {lesson.durationMinutes} min
                        {completed ? " · terminée" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <div className="min-w-0">
        <Card className="overflow-hidden bg-white/95">
          <CardContent className="p-6 md:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
              <Badge variant="outline">
                Leçon {selectedLessonIndex + 1} sur {course.lessons.length}
              </Badge>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {selectedLesson.durationMinutes} min
              </span>
            </div>

            <article className="py-7">
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                {selectedLesson.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {selectedLesson.summary}
              </p>

              <div className="mt-8 space-y-8">
                {selectedLesson.sections?.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-heading text-2xl font-semibold">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.checklist ? (
                      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                        {section.checklist.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-sm leading-6"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}

                {selectedLesson.exercise ? (
                  <section className="rounded-[24px] border border-primary/20 bg-primary/5 p-6">
                    <h2 className="font-heading text-xl font-semibold">
                      À vous de jouer
                    </h2>
                    <p className="mt-3 leading-7 text-muted-foreground">
                      {selectedLesson.exercise}
                    </p>
                  </section>
                ) : null}
              </div>
            </article>

            <div className="border-t border-border/70 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={selectedLessonIndex === 0}
                  onClick={() => {
                    const previousLesson =
                      course.lessons[selectedLessonIndex - 1];
                    if (previousLesson) setSelectedLessonId(previousLesson.id);
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Leçon précédente
                </Button>
                <Button type="button" onClick={completeAndContinue}>
                  {selectedLessonIndex === course.lessons.length - 1
                    ? "Terminer la formation"
                    : "Terminer et continuer"}
                  {selectedLessonIndex === course.lessons.length - 1 ? (
                    <Check className="ml-2 h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>

              {completedSet.has(selectedLesson.id) ? (
                <button
                  type="button"
                  className="mt-4 text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
                  onClick={() => setLessonCompletion(selectedLesson.id, false)}
                >
                  Marquer cette leçon comme non terminée
                </button>
              ) : null}

              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {statusMessage}
              </p>
            </div>
          </CardContent>
        </Card>

        {isComplete ? (
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-heading text-2xl font-semibold">
                  Formation terminée — bravo!
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Votre progression reste sur cet appareil pour vous permettre
                  de revoir les leçons.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/formations">Explorer d’autres formations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6 rounded-2xl border border-border/70 bg-white/70 p-5 text-sm leading-6 text-muted-foreground">
          <div className="flex gap-3">
            {storageAvailable ? (
              <Save className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            ) : (
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {storageAvailable
                  ? "Progression enregistrée uniquement sur cet appareil"
                  : "Progression temporaire pour cette visite"}
              </p>
              <p className="mt-1">
                Aucun compte, nom ou courriel n’est demandé. ForméducWeb ne
                reçoit pas votre progression. Effacer les données du navigateur
                peut la supprimer.
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center font-medium text-primary underline underline-offset-4"
                onClick={resetProgress}
              >
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Réinitialiser ma progression locale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
