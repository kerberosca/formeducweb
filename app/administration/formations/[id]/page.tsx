import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, FilePlus2, Rocket, Save } from "lucide-react";

import {
  addResourceAction,
  archiveCourseAction,
  archiveLessonAction,
  archiveModuleAction,
  archiveResourceAction,
  createModuleAction,
  duplicateCourseAction,
  publishCourseAction,
  saveLessonAction,
  saveQuizAction
} from "@/app/administration/actions";
import { ArchiveConfirmationButton } from "@/components/admin/archive-confirmation-button";
import { CourseForm } from "@/components/admin/course-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Modifier une formation",
  robots: { index: false, follow: false }
};
const selectClass =
  "h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm";
const starterContent = JSON.stringify(
  {
    version: 1,
    blocks: [{ type: "paragraph", text: "Rédigez ici le contenu de la leçon." }]
  },
  null,
  2
);

export default async function AdminCoursePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ statut?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { archivedAt: null },
            orderBy: { position: "asc" },
            include: {
              resources: { where: { archivedAt: null } },
              quiz: {
                include: {
                  questions: {
                    orderBy: { position: "asc" },
                    include: { choices: { orderBy: { position: "asc" } } }
                  },
                  _count: { select: { attempts: true } }
                }
              }
            }
          }
        }
      },
      resources: { where: { archivedAt: null, lessonId: null } },
      _count: { select: { enrollments: true } }
    }
  });
  if (!course) notFound();
  const nextModulePosition =
    Math.max(0, ...course.modules.map((module) => module.position)) + 1;
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/administration/formations"
            className="text-sm font-semibold text-primary"
          >
            ← Toutes les formations
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant={course.status === "published" ? "default" : "outline"}
            >
              {course.status}
            </Badge>
            <Badge variant="outline">
              {course._count.enrollments} inscription(s)
            </Badge>
          </div>
          <h1 className="mt-3 font-heading text-4xl font-semibold">
            {course.shortTitle}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={publishCourseAction}>
            <input type="hidden" name="courseId" value={course.id} />
            <Button type="submit">
              <Rocket className="mr-2 h-4 w-4" aria-hidden="true" />
              Publier
            </Button>
          </form>
          <form action={duplicateCourseAction}>
            <input type="hidden" name="courseId" value={course.id} />
            <Button type="submit" variant="secondary">
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              Dupliquer
            </Button>
          </form>
          <form action={archiveCourseAction}>
            <input type="hidden" name="courseId" value={course.id} />
            <ArchiveConfirmationButton
              buttonLabel="Archiver la formation"
              confirmationLabel={`la formation « ${course.shortTitle} »`}
            />
          </form>
        </div>
      </div>
      {query.statut === "enregistre" ? (
        <p
          className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950"
          role="status"
        >
          Formation enregistrée.
        </p>
      ) : null}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Métadonnées et offre</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm course={course} />
        </CardContent>
      </Card>
      <section className="mt-10" aria-labelledby="structure">
        <h2 id="structure" className="font-heading text-3xl font-semibold">
          Structure du parcours
        </h2>
        <p className="mt-2 text-muted-foreground">
          Le contenu est composé de blocs JSON validés. Aucun HTML arbitraire
          n’est accepté.
        </p>
        <div className="mt-6 space-y-7">
          {course.modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle>
                    {module.position}. {module.title}
                  </CardTitle>
                  <form action={archiveModuleAction}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={module.id} />
                    <ArchiveConfirmationButton
                      buttonLabel="Archiver le module"
                      confirmationLabel={`le module « ${module.title} »`}
                    />
                  </form>
                </div>
                {module.description ? (
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-7">
                {module.lessons.map((lesson) => {
                  const quizQuestions = lesson.quiz?.questions.map(
                    (question) => ({
                      prompt: question.prompt,
                      explanation: question.explanation,
                      choices: question.choices.map((choice) => ({
                        label: choice.label,
                        isCorrect: choice.isCorrect
                      }))
                    })
                  ) ?? [
                    {
                      prompt: "Question à personnaliser",
                      explanation: "Expliquez la réponse.",
                      choices: [
                        { label: "Bonne réponse", isCorrect: true },
                        { label: "Autre réponse", isCorrect: false }
                      ]
                    }
                  ];
                  return (
                    <div
                      key={lesson.id}
                      className="rounded-2xl border border-border/70 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Badge
                            variant={
                              lesson.status === "published"
                                ? "default"
                                : "outline"
                            }
                          >
                            {lesson.status}
                          </Badge>
                          <h3 className="mt-2 font-heading text-xl font-semibold">
                            {lesson.position}. {lesson.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <span className="text-sm text-muted-foreground">
                            {lesson.durationMinutes} min
                          </span>
                          <form action={archiveLessonAction}>
                            <input
                              type="hidden"
                              name="courseId"
                              value={course.id}
                            />
                            <input
                              type="hidden"
                              name="lessonId"
                              value={lesson.id}
                            />
                            <ArchiveConfirmationButton
                              buttonLabel="Archiver la leçon"
                              confirmationLabel={`la leçon « ${lesson.title} »`}
                            />
                          </form>
                        </div>
                      </div>
                      <details className="mt-5">
                        <summary className="cursor-pointer font-semibold text-primary">
                          Modifier la leçon
                        </summary>
                        <form
                          action={saveLessonAction}
                          className="mt-5 grid gap-4 md:grid-cols-2"
                        >
                          <input type="hidden" name="id" value={lesson.id} />
                          <input
                            type="hidden"
                            name="moduleId"
                            value={module.id}
                          />
                          <div>
                            <Label>Adresse courte</Label>
                            <Input
                              name="slug"
                              defaultValue={lesson.slug}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Titre</Label>
                            <Input
                              name="title"
                              defaultValue={lesson.title}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Résumé</Label>
                            <Textarea
                              name="summary"
                              defaultValue={lesson.summary}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              name="position"
                              type="number"
                              min={1}
                              defaultValue={lesson.position}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Durée</Label>
                            <Input
                              name="durationMinutes"
                              type="number"
                              min={1}
                              defaultValue={lesson.durationMinutes}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>État</Label>
                            <select
                              name="status"
                              className={`${selectClass} mt-2`}
                              defaultValue={lesson.status}
                            >
                              <option value="draft">Brouillon</option>
                              <option value="published">Publiée</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2 self-end pb-3 text-sm">
                            <input
                              type="checkbox"
                              name="isRequired"
                              defaultChecked={lesson.isRequired}
                            />
                            Obligatoire
                          </label>
                          <div className="md:col-span-2">
                            <Label>Contenu JSON versionné</Label>
                            <Textarea
                              name="contentJson"
                              rows={14}
                              defaultValue={JSON.stringify(
                                lesson.content,
                                null,
                                2
                              )}
                              required
                              className="mt-2 font-mono text-xs"
                            />
                          </div>
                          <Button type="submit">
                            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                            Enregistrer la leçon
                          </Button>
                        </form>
                      </details>
                      <details className="mt-4">
                        <summary className="cursor-pointer font-semibold text-primary">
                          Questionnaire{" "}
                          {lesson.quiz
                            ? `(${lesson.quiz.status}, ${lesson.quiz._count.attempts} tentative(s))`
                            : ""}
                        </summary>
                        <form
                          action={saveQuizAction}
                          className="mt-5 grid gap-4 md:grid-cols-2"
                        >
                          <input
                            type="hidden"
                            name="lessonId"
                            value={lesson.id}
                          />
                          <div>
                            <Label>Titre</Label>
                            <Input
                              name="title"
                              defaultValue={
                                lesson.quiz?.title ??
                                `Validation — ${lesson.title}`
                              }
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              name="description"
                              defaultValue={lesson.quiz?.description ?? ""}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Seuil (%)</Label>
                            <Input
                              name="passingScore"
                              type="number"
                              min={1}
                              max={100}
                              defaultValue={lesson.quiz?.passingScore ?? 80}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Tentatives maximum</Label>
                            <Input
                              name="maxAttempts"
                              type="number"
                              min={1}
                              defaultValue={lesson.quiz?.maxAttempts ?? 3}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>État</Label>
                            <select
                              name="status"
                              className={`${selectClass} mt-2`}
                              defaultValue={lesson.quiz?.status ?? "draft"}
                            >
                              <option value="draft">Brouillon</option>
                              <option value="published">Publié</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Questions JSON</Label>
                            <Textarea
                              name="questionsJson"
                              rows={12}
                              defaultValue={JSON.stringify(
                                quizQuestions,
                                null,
                                2
                              )}
                              required
                              className="mt-2 font-mono text-xs"
                            />
                          </div>
                          <Button type="submit">
                            Enregistrer le questionnaire
                          </Button>
                        </form>
                      </details>
                      {lesson.resources.length ? (
                        <ul className="mt-4 space-y-2">
                          {lesson.resources.map((resource) => (
                            <li
                              key={resource.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3 text-sm text-muted-foreground"
                            >
                              <span>Ressource : {resource.title}</span>
                              <form action={archiveResourceAction}>
                                <input
                                  type="hidden"
                                  name="courseId"
                                  value={course.id}
                                />
                                <input
                                  type="hidden"
                                  name="resourceId"
                                  value={resource.id}
                                />
                                <ArchiveConfirmationButton
                                  buttonLabel="Archiver la ressource"
                                  confirmationLabel={`la ressource « ${resource.title} »`}
                                />
                              </form>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
                <details>
                  <summary className="cursor-pointer font-semibold text-primary">
                    Ajouter une leçon
                  </summary>
                  <form
                    action={saveLessonAction}
                    className="mt-5 grid gap-4 md:grid-cols-2"
                  >
                    <input type="hidden" name="moduleId" value={module.id} />
                    <div>
                      <Label>Adresse courte</Label>
                      <Input name="slug" required className="mt-2" />
                    </div>
                    <div>
                      <Label>Titre</Label>
                      <Input name="title" required className="mt-2" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Résumé</Label>
                      <Textarea name="summary" required className="mt-2" />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        name="position"
                        type="number"
                        min={1}
                        defaultValue={module.lessons.length + 1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Durée</Label>
                      <Input
                        name="durationMinutes"
                        type="number"
                        min={1}
                        defaultValue={15}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>État</Label>
                      <select
                        name="status"
                        className={`${selectClass} mt-2`}
                        defaultValue="draft"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="published">Publiée</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isRequired" defaultChecked />
                      Obligatoire
                    </label>
                    <div className="md:col-span-2">
                      <Label>Contenu JSON</Label>
                      <Textarea
                        name="contentJson"
                        rows={8}
                        defaultValue={starterContent}
                        className="mt-2 font-mono text-xs"
                      />
                    </div>
                    <Button type="submit">
                      <FilePlus2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Ajouter
                    </Button>
                  </form>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ajouter un module</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={createModuleAction}
              className="grid gap-4 md:grid-cols-2"
            >
              <input type="hidden" name="courseId" value={course.id} />
              <div>
                <Label>Titre</Label>
                <Input name="title" required className="mt-2" />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  name="position"
                  type="number"
                  min={1}
                  defaultValue={nextModulePosition}
                  className="mt-2"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea name="description" className="mt-2" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isRequired" defaultChecked />
                Module obligatoire
              </label>
              <div className="md:col-span-2">
                <Button type="submit">Ajouter le module</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
      <section className="mt-10" aria-labelledby="ressources">
        <h2 id="ressources" className="font-heading text-3xl font-semibold">
          Ressources protégées
        </h2>
        {course.resources.length ? (
          <ul className="mt-4 space-y-2">
            {course.resources.map((resource) => (
              <li
                key={resource.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-white p-4"
              >
                <div>
                  <p className="font-semibold">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {resource.fileName ?? resource.externalUrl}
                  </p>
                </div>
                <form action={archiveResourceAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <ArchiveConfirmationButton
                    buttonLabel="Archiver la ressource"
                    confirmationLabel={`la ressource « ${resource.title} »`}
                  />
                </form>
              </li>
            ))}
          </ul>
        ) : null}
        <Card className="mt-5">
          <CardContent className="p-6">
            <form
              action={addResourceAction}
              className="grid gap-4 md:grid-cols-2"
            >
              <input type="hidden" name="courseId" value={course.id} />
              <div>
                <Label>Titre</Label>
                <Input name="title" required className="mt-2" />
              </div>
              <div>
                <Label>Associer à une leçon</Label>
                <select name="lessonId" className={`${selectClass} mt-2`}>
                  <option value="">Formation entière</option>
                  {course.modules
                    .flatMap((module) => module.lessons)
                    .map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea name="description" className="mt-2" />
              </div>
              <div>
                <Label>Fichier (25 Mo maximum)</Label>
                <Input
                  name="file"
                  type="file"
                  accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.png,.jpg,.jpeg"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>ou lien HTTPS</Label>
                <Input name="externalUrl" type="url" className="mt-2" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Ajouter la ressource</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
