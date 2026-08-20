"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileCheck2,
  History,
  LoaderCircle
} from "lucide-react";

import type {
  LearningLesson,
  LearningModule,
  LessonBlock,
  PublicCourseSummary
} from "@/components/lms/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTrainingProgressKey } from "@/lib/training";
import { cn } from "@/lib/utils";

type InitialProgress = {
  lessonId: string;
  status: string;
  lastPosition: number;
}[];

type CoursePlayerProps = {
  course: PublicCourseSummary;
  modules: LearningModule[];
  initialProgress: InitialProgress;
  initialLastLessonId: string | null;
  certificateToken: string | null;
  courseResources: LearningLesson["resources"];
};

function LessonContent({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="mt-8 space-y-7">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "title") {
          return block.level === 2 ? (
            <h2 key={key} className="font-heading text-2xl font-semibold">
              {block.text}
            </h2>
          ) : block.level === 3 ? (
            <h3 key={key} className="font-heading text-xl font-semibold">
              {block.text}
            </h3>
          ) : (
            <h4 key={key} className="font-heading text-lg font-semibold">
              {block.text}
            </h4>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p key={key} className="leading-8 text-muted-foreground">
              {block.text}
            </p>
          );
        }
        if (block.type === "list") {
          const List = block.style === "numbered" ? "ol" : "ul";
          return (
            <List
              key={key}
              className={cn(
                "space-y-3 pl-6 leading-7 text-muted-foreground",
                block.style === "numbered" ? "list-decimal" : "list-disc"
              )}
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </List>
          );
        }
        if (block.type === "callout") {
          return (
            <aside
              key={key}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
            >
              <p className="font-semibold">{block.title ?? "À retenir"}</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                {block.text}
              </p>
            </aside>
          );
        }
        if (block.type === "steps") {
          return (
            <section key={key}>
              <ol className="space-y-4">
                {block.items.map((item, stepIndex) => (
                  <li key={`${item.title}-${stepIndex}`} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {stepIndex + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      {item.text ? (
                        <p className="mt-1 leading-7 text-muted-foreground">
                          {item.text}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={key}>
              <Image
                src={block.src}
                alt={block.alt}
                width={1200}
                height={675}
                unoptimized
                className="h-auto w-full rounded-2xl border border-border/70"
              />
              {block.caption ? (
                <figcaption className="mt-2 text-sm text-muted-foreground">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }
        if (block.type === "link") {
          return (
            <a
              key={key}
              href={block.href}
              target={block.href.startsWith("http") ? "_blank" : undefined}
              rel={block.href.startsWith("http") ? "noreferrer" : undefined}
              className="block rounded-2xl border border-border/70 p-5 transition hover:border-primary/40"
            >
              <span className="font-semibold text-primary">
                {block.label}
                <ExternalLink
                  className="ml-2 inline h-4 w-4"
                  aria-hidden="true"
                />
              </span>
              {block.description ? (
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                  {block.description}
                </span>
              ) : null}
            </a>
          );
        }
        return (
          <section
            key={key}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6"
          >
            <h2 className="font-heading text-xl font-semibold">
              {block.title}
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {block.instructions}
            </p>
            {block.successCriteria.length ? (
              <ul className="mt-4 space-y-2">
                {block.successCriteria.map((criterion) => (
                  <li key={criterion} className="flex gap-2 text-sm">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {criterion}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function LessonQuiz({ lesson }: { lesson: LearningLesson }) {
  const quiz = lesson.quiz;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    message?: string;
  } | null>(null);
  const [error, setError] = useState("");
  if (!quiz) return null;

  async function submitQuiz() {
    if (Object.keys(answers).length !== quiz!.questions.length) {
      setError(
        "Répondez à toutes les questions avant de remettre le questionnaire."
      );
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/lms/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz!.id,
          answers: Object.entries(answers).map(([questionId, choiceId]) => ({
            questionId,
            choiceId
          }))
        })
      });
      const payload = (await response.json()) as {
        attempt?: { score?: number; passed?: boolean; feedback?: unknown };
        error?: string;
      };
      if (!response.ok || typeof payload.attempt?.score !== "number")
        throw new Error(
          payload.error || "Le questionnaire ne peut pas être remis."
        );
      setResult({
        score: payload.attempt.score,
        passed: Boolean(payload.attempt.passed),
        message: payload.attempt.passed
          ? "Votre réussite a été enregistrée. Votre certificat apparaîtra dans Mon espace dès que tous les critères sont atteints."
          : "Revoyez la leçon avant une nouvelle tentative."
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Le questionnaire ne peut pas être remis."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="mt-9 rounded-[24px] border border-border/70 bg-muted/20 p-6"
      aria-labelledby={`quiz-${quiz.id}`}
    >
      <Badge variant="secondary">Questionnaire</Badge>
      <h2
        id={`quiz-${quiz.id}`}
        className="mt-3 font-heading text-2xl font-semibold"
      >
        {quiz.title}
      </h2>
      {quiz.description ? (
        <p className="mt-2 text-muted-foreground">{quiz.description}</p>
      ) : null}
      <p className="mt-2 text-sm text-muted-foreground">
        Seuil de réussite : {quiz.passingScore} %
        {quiz.maxAttempts ? ` · ${quiz.maxAttempts} tentatives maximum` : ""}
      </p>
      <div className="mt-6 space-y-7">
        {quiz.questions.map((question, questionIndex) => (
          <fieldset key={question.id}>
            <legend className="font-semibold">
              {questionIndex + 1}. {question.prompt}
            </legend>
            <div className="mt-3 space-y-2">
              {question.choices.map((choice) => (
                <label
                  key={choice.id}
                  className="flex cursor-pointer gap-3 rounded-xl border border-border/70 bg-white p-3 text-sm hover:border-primary/40"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={choice.id}
                    checked={answers[question.id] === choice.id}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: choice.id
                      }))
                    }
                    className="mt-1"
                  />
                  {choice.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <Button
        type="button"
        className="mt-6"
        disabled={pending}
        onClick={submitQuiz}
      >
        {pending ? (
          <LoaderCircle
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : null}
        Remettre mes réponses
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <div
          className={cn(
            "mt-4 rounded-xl p-4 text-sm",
            result.passed
              ? "bg-emerald-50 text-emerald-900"
              : "bg-amber-50 text-amber-950"
          )}
          role="status"
        >
          <p className="font-semibold">
            Résultat : {result.score} % —{" "}
            {result.passed ? "réussi" : "à reprendre"}
          </p>
          {result.message ? <p className="mt-1">{result.message}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

export function ServerCoursePlayer({
  course,
  modules,
  initialProgress,
  initialLastLessonId,
  certificateToken,
  courseResources
}: CoursePlayerProps) {
  const lessons = useMemo(
    () =>
      modules.flatMap((module) =>
        module.lessons.map((lesson) => ({
          ...lesson,
          moduleTitle: module.title
        }))
      ),
    [modules]
  );
  const progressMap = useMemo(
    () => new Map(initialProgress.map((item) => [item.lessonId, item])),
    [initialProgress]
  );
  const [completedIds, setCompletedIds] = useState(() =>
    initialProgress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId)
  );
  const [selectedId, setSelectedId] = useState(() =>
    initialLastLessonId &&
    lessons.some((lesson) => lesson.id === initialLastLessonId)
      ? initialLastLessonId
      : (lessons[0]?.id ?? "")
  );
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [legacyPrompt, setLegacyPrompt] = useState<{
    completedLessonIds: string[];
    lastLessonId: string;
  } | null>(null);
  const selectedIndex = Math.max(
    0,
    lessons.findIndex((lesson) => lesson.id === selectedId)
  );
  const lesson = lessons[selectedIndex];
  const requiredLessons = lessons.filter((candidate) => candidate.isRequired);
  const completedRequiredCount = requiredLessons.filter((candidate) =>
    completedIds.includes(candidate.id)
  ).length;
  const percentage = requiredLessons.length
    ? Math.round((completedRequiredCount / requiredLessons.length) * 100)
    : 0;

  async function saveProgress(
    lessonId: string,
    progressStatus: "in_progress" | "completed"
  ) {
    setPendingLessonId(lessonId);
    setStatus("");
    try {
      const response = await fetch("/api/lms/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          courseId: course.id,
          lessonId,
          status: progressStatus,
          lastPosition: 0
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(
          payload.error || "La progression ne peut pas être enregistrée."
        );
      if (progressStatus === "completed")
        setCompletedIds((current) =>
          Array.from(new Set([...current, lessonId]))
        );
      setStatus("Progression enregistrée.");
      return true;
    } catch (saveError) {
      setStatus(
        saveError instanceof Error
          ? saveError.message
          : "La progression ne peut pas être enregistrée."
      );
      return false;
    } finally {
      setPendingLessonId(null);
    }
  }

  function inspectLegacyProgress() {
    try {
      const raw = window.localStorage.getItem(
        getTrainingProgressKey(course.slug)
      );
      if (!raw)
        return setStatus(
          "Aucune ancienne progression n’a été trouvée sur cet appareil."
        );
      const parsed = JSON.parse(raw) as {
        version?: number;
        courseSlug?: string;
        completedLessonIds?: unknown;
        lastLessonId?: unknown;
      };
      if (
        parsed.version !== 1 ||
        parsed.courseSlug !== course.slug ||
        !Array.isArray(parsed.completedLessonIds) ||
        typeof parsed.lastLessonId !== "string"
      )
        return setStatus(
          "L’ancienne progression trouvée n’est pas compatible."
        );
      setLegacyPrompt({
        completedLessonIds: parsed.completedLessonIds.filter(
          (item): item is string => typeof item === "string"
        ),
        lastLessonId: parsed.lastLessonId
      });
    } catch {
      setStatus("L’ancienne progression ne peut pas être lue.");
    }
  }

  async function importLegacyProgress() {
    if (!legacyPrompt) return;
    setPendingLessonId("legacy");
    try {
      const items = lessons.map((candidate) => ({
        lessonSlug: candidate.slug,
        completed: legacyPrompt.completedLessonIds.includes(candidate.slug),
        lastPosition: 0
      }));
      const response = await fetch("/api/lms/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "import_legacy",
          courseId: course.id,
          confirmed: true,
          items
        })
      });
      const payload = (await response.json()) as {
        error?: string;
        alreadyImported?: boolean;
      };
      if (!response.ok)
        throw new Error(payload.error || "L’import ne peut pas être effectué.");
      setCompletedIds((current) =>
        Array.from(
          new Set([
            ...current,
            ...lessons
              .filter((candidate) =>
                legacyPrompt.completedLessonIds.includes(candidate.slug)
              )
              .map((candidate) => candidate.id)
          ])
        )
      );
      const last = lessons.find(
        (candidate) => candidate.slug === legacyPrompt.lastLessonId
      );
      if (last) setSelectedId(last.id);
      setLegacyPrompt(null);
      setStatus(
        payload.alreadyImported
          ? "Cette progression avait déjà été importée."
          : "Ancienne progression importée. La progression serveur est maintenant la référence."
      );
    } catch (importError) {
      setStatus(
        importError instanceof Error
          ? importError.message
          : "L’import ne peut pas être effectué."
      );
    } finally {
      setPendingLessonId(null);
    }
  }

  if (!lesson)
    return (
      <Card>
        <CardContent className="p-8">
          Cette formation ne contient pas encore de leçon publiée.
        </CardContent>
      </Card>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
      <aside className="space-y-5 lg:sticky lg:top-28">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex justify-between gap-3">
              <p className="text-sm font-semibold">Votre progression</p>
              <span className="text-sm font-semibold text-primary">
                {percentage} %
              </span>
            </div>
            <Progress
              value={percentage}
              aria-label={`${percentage} % de la formation terminée`}
            />
            <p className="text-xs text-muted-foreground">
              {completedRequiredCount} leçon
              {completedRequiredCount === 1 ? "" : "s"} obligatoire
              {completedRequiredCount === 1 ? "" : "s"} sur{" "}
              {requiredLessons.length}
            </p>
            {certificateToken ? (
              <Button asChild size="sm" variant="secondary" className="w-full">
                <Link href={`/certificats/verifier/${certificateToken}`}>
                  <FileCheck2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Voir mon certificat
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <nav aria-label={`Leçons — ${course.shortTitle}`}>
          <ol className="space-y-2">
            {lessons.map((candidate, index) => {
              const completed = completedIds.includes(candidate.id);
              const selected = candidate.id === lesson.id;
              return (
                <li key={candidate.id}>
                  <button
                    type="button"
                    aria-current={selected ? "step" : undefined}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border/70 bg-white/75 hover:border-primary/40"
                    )}
                    onClick={() => {
                      setSelectedId(candidate.id);
                      void saveProgress(
                        candidate.id,
                        progressMap.get(candidate.id)?.status === "completed"
                          ? "completed"
                          : "in_progress"
                      );
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
                        {candidate.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                        {candidate.durationMinutes} min
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={inspectLegacyProgress}
        >
          <History className="mr-2 h-4 w-4" aria-hidden="true" />
          Importer une ancienne progression
        </Button>
        {courseResources.map((resource) => (
          <a
            key={resource.id}
            href={`/api/lms/resources/${resource.id}/download`}
            className="flex gap-2 rounded-xl border border-border/70 bg-white p-3 text-sm font-semibold text-primary"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            {resource.title}
          </a>
        ))}
      </aside>
      <div className="min-w-0">
        {legacyPrompt ? (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h2 className="font-heading text-xl font-semibold">
                Importer la progression de cet appareil?
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Cette action est volontaire et ne peut être effectuée qu’une
                fois. Après l’import, la progression conservée dans votre compte
                devient la source de vérité.
              </p>
              <div className="mt-4 flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={pendingLessonId === "legacy"}
                  onClick={importLegacyProgress}
                >
                  Confirmer l’import
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setLegacyPrompt(null)}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        <Card className="overflow-hidden bg-white/95">
          <CardContent className="p-6 md:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
              <div>
                <Badge variant="outline">
                  Leçon {selectedIndex + 1} sur {lessons.length}
                </Badge>
                <p className="mt-2 text-xs text-muted-foreground">
                  {lesson.moduleTitle}
                </p>
              </div>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {lesson.durationMinutes} min
              </span>
            </div>
            <article className="py-7">
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                {lesson.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {lesson.summary}
              </p>
              <LessonContent blocks={lesson.content.blocks} />
              {lesson.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={`/api/lms/resources/${resource.id}/download`}
                  className="mt-5 flex gap-3 rounded-2xl border border-border/70 p-4 font-semibold text-primary"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  <span>
                    {resource.title}
                    {resource.description ? (
                      <span className="mt-1 block text-sm font-normal text-muted-foreground">
                        {resource.description}
                      </span>
                    ) : null}
                  </span>
                </a>
              ))}
              <LessonQuiz lesson={lesson} />
            </article>
            <div className="border-t border-border/70 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={selectedIndex === 0}
                  onClick={() => setSelectedId(lessons[selectedIndex - 1]!.id)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Leçon précédente
                </Button>
                <Button
                  type="button"
                  disabled={pendingLessonId === lesson.id}
                  onClick={async () => {
                    if (await saveProgress(lesson.id, "completed")) {
                      const next = lessons[selectedIndex + 1];
                      if (next) setSelectedId(next.id);
                    }
                  }}
                >
                  {pendingLessonId === lesson.id ? (
                    <LoaderCircle
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  {selectedIndex === lessons.length - 1
                    ? "Terminer la formation"
                    : "Terminer et continuer"}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <p
                className="mt-3 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {status}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
