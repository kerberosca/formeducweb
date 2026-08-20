"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  ALLOWED_RESOURCE_MIME_TYPES,
  COURSE_FORMATS,
  COURSE_LEVELS,
  MAX_RESOURCE_BYTES
} from "@/lib/lms/constants";
import { lessonContentSchema } from "@/lib/lms/validation";
import {
  getSafeExternalResourceUrl,
  type AllowedResourceExtension,
  validateResourceFileContents
} from "@/lib/lms/resources";

const idSchema = z.string().cuid();
const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/administration");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isActive || user.role !== "admin") redirect("/mon-espace");
  return user;
}

async function recordAudit(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
}) {
  await db.adminAuditLog.create({ data: input });
}

function revalidateCourseContent(courseId: string, courseSlug: string) {
  revalidatePath(`/administration/formations/${courseId}`);
  revalidatePath("/formations");
  revalidatePath(`/formations/${courseSlug}`);
  revalidatePath(`/formations/${courseSlug}/apprendre`);
  revalidatePath("/mon-espace");
}

const courseSchema = z.object({
  id: idSchema.optional(),
  slug: slugSchema,
  title: text(180),
  shortTitle: text(100),
  description: text(2_000),
  theme: text(60),
  level: z.enum(COURSE_LEVELS),
  offer: z.enum(["free", "paid", "custom"]),
  priceCents: z.coerce.number().int().min(0).max(10_000_000).nullable(),
  durationMinutes: z.coerce.number().int().min(1).max(100_000),
  durationLabel: text(100),
  format: z.enum(COURSE_FORMATS),
  audience: text(2_000),
  outcomes: z.string().trim().max(8_000),
  prerequisites: z.string().trim().max(8_000),
  isPurchasable: z.boolean(),
  featured: z.boolean()
});

function lineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function parseCourseForm(formData: FormData) {
  return courseSchema.parse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    shortTitle: formData.get("shortTitle"),
    description: formData.get("description"),
    theme: formData.get("theme"),
    level: formData.get("level"),
    offer: formData.get("offer"),
    priceCents: formData.get("priceCents")
      ? Number(formData.get("priceCents"))
      : null,
    durationMinutes: formData.get("durationMinutes"),
    durationLabel: formData.get("durationLabel"),
    format: formData.get("format"),
    audience: formData.get("audience"),
    outcomes: formData.get("outcomes"),
    prerequisites: formData.get("prerequisites"),
    isPurchasable: formData.get("isPurchasable") === "on",
    featured: formData.get("featured") === "on"
  });
}

export async function saveCourseAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = parseCourseForm(formData);
  if (
    input.offer === "paid" &&
    input.isPurchasable &&
    (!input.priceCents || input.priceCents <= 0)
  )
    throw new Error(
      "Une formation payante achetable doit avoir un prix positif."
    );
  if (input.slug === "word-documents-professionnels" && input.isPurchasable)
    throw new Error(
      "Word reste en préparation tant que son contenu n’est pas complet."
    );
  const data = {
    slug: input.slug,
    title: input.title,
    shortTitle: input.shortTitle,
    description: input.description,
    theme: input.theme,
    level: input.level,
    offer: input.offer,
    priceCents: input.offer === "free" ? 0 : input.priceCents,
    currency: "cad",
    durationMinutes: input.durationMinutes,
    durationLabel: input.durationLabel,
    format: input.format,
    audience: input.audience,
    outcomes: lineList(input.outcomes),
    prerequisites: lineList(input.prerequisites),
    isPurchasable: input.offer === "paid" && input.isPurchasable,
    featured: input.featured
  } satisfies Prisma.CourseUncheckedCreateInput;
  if (input.id) {
    const before = await db.course.findUniqueOrThrow({
      where: { id: input.id }
    });
    if (
      before.slug === "word-documents-professionnels" &&
      (input.slug !== before.slug || input.isPurchasable)
    ) {
      throw new Error(
        "La formation Word en préparation ne peut pas être renommée ni rendue achetable."
      );
    }
    const course = await db.course.update({ where: { id: input.id }, data });
    await recordAudit({
      actorId: actor.id,
      action: "course.updated",
      entityType: "Course",
      entityId: course.id,
      before: { slug: before.slug, title: before.title, status: before.status },
      after: { slug: course.slug, title: course.title, status: course.status }
    });
    revalidatePath(`/administration/formations/${course.id}`);
    revalidatePath("/formations");
    redirect(`/administration/formations/${course.id}?statut=enregistre`);
  }
  const course = await db.course.create({ data: { ...data, status: "draft" } });
  await recordAudit({
    actorId: actor.id,
    action: "course.created",
    entityType: "Course",
    entityId: course.id,
    after: { slug: course.slug, title: course.title }
  });
  redirect(`/administration/formations/${course.id}`);
}

export async function createModuleAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      courseId: idSchema,
      title: text(180),
      description: optionalText(1_000),
      position: z.coerce.number().int().min(1).max(10_000),
      isRequired: z.boolean()
    })
    .parse({
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      description: formData.get("description"),
      position: formData.get("position"),
      isRequired: formData.get("isRequired") === "on"
    });
  if (input.isRequired) {
    const enrollmentCount = await db.enrollment.count({
      where: { courseId: input.courseId }
    });
    if (enrollmentCount > 0) {
      throw new Error(
        "Ajoutez les nouveaux contenus obligatoires dans une version dupliquée de la formation."
      );
    }
  }
  const courseModule = await db.courseModule.create({ data: input });
  await recordAudit({
    actorId: actor.id,
    action: "module.created",
    entityType: "CourseModule",
    entityId: courseModule.id,
    after: {
      courseId: courseModule.courseId,
      title: courseModule.title,
      position: courseModule.position
    }
  });
  revalidatePath(`/administration/formations/${input.courseId}`);
}

export async function saveLessonAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      id: idSchema.optional(),
      moduleId: idSchema,
      slug: slugSchema,
      title: text(180),
      summary: text(1_000),
      durationMinutes: z.coerce.number().int().min(1).max(10_000),
      position: z.coerce.number().int().min(1).max(10_000),
      status: z.enum(["draft", "published"]),
      isRequired: z.boolean(),
      contentJson: text(100_000)
    })
    .parse({
      id: formData.get("id") || undefined,
      moduleId: formData.get("moduleId"),
      slug: formData.get("slug"),
      title: formData.get("title"),
      summary: formData.get("summary"),
      durationMinutes: formData.get("durationMinutes"),
      position: formData.get("position"),
      status: formData.get("status"),
      isRequired: formData.get("isRequired") === "on",
      contentJson: formData.get("contentJson")
    });
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(input.contentJson);
  } catch {
    throw new Error("Le contenu JSON de la leçon est invalide.");
  }
  const content = lessonContentSchema.parse(parsedJson);
  const courseModule = await db.courseModule.findUniqueOrThrow({
    where: { id: input.moduleId },
    select: {
      courseId: true,
      course: { select: { _count: { select: { enrollments: true } } } }
    }
  });
  if (input.id) {
    const before = await db.lesson.findUniqueOrThrow({
      where: { id: input.id }
    });
    if (before.moduleId !== input.moduleId) {
      throw new Error("La leçon n’appartient pas au module indiqué.");
    }
    if (
      courseModule.course._count.enrollments > 0 &&
      before.isRequired !== input.isRequired
    ) {
      throw new Error(
        "Le caractère obligatoire d’une leçon déjà offerte ne peut pas être modifié. Dupliquez la formation."
      );
    }
    if (
      courseModule.course._count.enrollments > 0 &&
      before.isRequired &&
      (!input.isRequired ||
        (before.status === "published" && input.status !== "published"))
    ) {
      throw new Error(
        "Une leçon obligatoire déjà suivie ne peut pas être retirée du parcours. Dupliquez la formation pour créer une nouvelle version."
      );
    }
    if (
      courseModule.course._count.enrollments > 0 &&
      before.isRequired &&
      JSON.stringify(before.content) !== JSON.stringify(content)
    )
      throw new Error(
        "Une leçon obligatoire déjà suivie ne peut pas être remplacée. Dupliquez la formation pour créer une nouvelle version."
      );
    const lesson = await db.lesson.update({
      where: { id: input.id },
      data: {
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        durationMinutes: input.durationMinutes,
        position: input.position,
        status: input.status,
        isRequired: input.isRequired,
        content
      }
    });
    await recordAudit({
      actorId: actor.id,
      action: "lesson.updated",
      entityType: "Lesson",
      entityId: lesson.id,
      before: { title: before.title, status: before.status },
      after: { title: lesson.title, status: lesson.status }
    });
  } else {
    if (courseModule.course._count.enrollments > 0 && input.isRequired) {
      throw new Error(
        "Ajoutez les nouvelles leçons obligatoires dans une version dupliquée de la formation."
      );
    }
    const lesson = await db.lesson.create({
      data: {
        moduleId: input.moduleId,
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        durationMinutes: input.durationMinutes,
        position: input.position,
        status: input.status,
        isRequired: input.isRequired,
        content,
        contentVersion: 1
      }
    });
    await recordAudit({
      actorId: actor.id,
      action: "lesson.created",
      entityType: "Lesson",
      entityId: lesson.id,
      after: { title: lesson.title, moduleId: lesson.moduleId }
    });
  }
  revalidatePath(`/administration/formations/${courseModule.courseId}`);
}

export async function saveQuizAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      lessonId: idSchema,
      title: text(180),
      description: optionalText(1_000),
      passingScore: z.coerce.number().int().min(1).max(100),
      maxAttempts: z.coerce.number().int().min(1).max(100).nullable(),
      status: z.enum(["draft", "published"]),
      questionsJson: text(100_000)
    })
    .parse({
      lessonId: formData.get("lessonId"),
      title: formData.get("title"),
      description: formData.get("description"),
      passingScore: formData.get("passingScore"),
      maxAttempts: formData.get("maxAttempts")
        ? Number(formData.get("maxAttempts"))
        : null,
      status: formData.get("status"),
      questionsJson: formData.get("questionsJson")
    });
  let rawQuestions: unknown;
  try {
    rawQuestions = JSON.parse(input.questionsJson);
  } catch {
    throw new Error("Le JSON du questionnaire est invalide.");
  }
  const questions = z
    .array(
      z
        .object({
          prompt: text(1_000),
          explanation: optionalText(2_000),
          choices: z
            .array(
              z.object({ label: text(500), isCorrect: z.boolean() }).strict()
            )
            .min(2)
            .max(10)
        })
        .strict()
    )
    .min(1)
    .max(100)
    .parse(rawQuestions);
  if (
    questions.some(
      (question) =>
        question.choices.filter((choice) => choice.isCorrect).length !== 1
    )
  )
    throw new Error("Chaque question doit avoir exactement une bonne réponse.");
  const lesson = await db.lesson.findUniqueOrThrow({
    where: { id: input.lessonId },
    select: {
      isRequired: true,
      module: {
        select: {
          courseId: true,
          isRequired: true,
          course: { select: { _count: { select: { enrollments: true } } } }
        }
      },
      quiz: { include: { _count: { select: { attempts: true } } } }
    }
  });
  if (
    lesson.module.course._count.enrollments > 0 &&
    lesson.module.isRequired &&
    lesson.isRequired
  ) {
    throw new Error(
      "Le questionnaire d’une leçon obligatoire déjà offerte doit être modifié dans une version dupliquée."
    );
  }
  if (lesson.quiz?._count.attempts)
    throw new Error(
      "Un questionnaire déjà tenté ne peut pas être remplacé. Dupliquez la formation pour une nouvelle version."
    );
  const quiz = await db.$transaction(async (tx) => {
    if (lesson.quiz)
      await tx.quizQuestion.deleteMany({ where: { quizId: lesson.quiz.id } });
    return tx.quiz.upsert({
      where: { lessonId: input.lessonId },
      create: {
        lessonId: input.lessonId,
        title: input.title,
        description: input.description,
        passingScore: input.passingScore,
        maxAttempts: input.maxAttempts,
        status: input.status,
        questions: {
          create: questions.map((question, index) => ({
            prompt: question.prompt,
            explanation: question.explanation,
            position: index + 1,
            choices: {
              create: question.choices.map((choice, choiceIndex) => ({
                label: choice.label,
                isCorrect: choice.isCorrect,
                position: choiceIndex + 1
              }))
            }
          }))
        }
      },
      update: {
        title: input.title,
        description: input.description,
        passingScore: input.passingScore,
        maxAttempts: input.maxAttempts,
        status: input.status,
        questions: {
          create: questions.map((question, index) => ({
            prompt: question.prompt,
            explanation: question.explanation,
            position: index + 1,
            choices: {
              create: question.choices.map((choice, choiceIndex) => ({
                label: choice.label,
                isCorrect: choice.isCorrect,
                position: choiceIndex + 1
              }))
            }
          }))
        }
      }
    });
  });
  await recordAudit({
    actorId: actor.id,
    action: "quiz.saved",
    entityType: "Quiz",
    entityId: quiz.id,
    after: {
      lessonId: input.lessonId,
      status: quiz.status,
      questionCount: questions.length
    }
  });
  revalidatePath(`/administration/formations/${lesson.module.courseId}`);
}

export async function archiveCourseAction(formData: FormData) {
  const actor = await requireAdmin();
  const courseId = idSchema.parse(formData.get("courseId"));
  const before = await db.course.findUniqueOrThrow({ where: { id: courseId } });
  const course = await db.course.update({
    where: { id: courseId },
    data: { status: "archived", archivedAt: new Date(), isPurchasable: false }
  });
  await recordAudit({
    actorId: actor.id,
    action: "course.archived",
    entityType: "Course",
    entityId: course.id,
    before: { status: before.status },
    after: { status: course.status }
  });
  revalidatePath("/administration/formations");
  revalidatePath("/formations");
  redirect("/administration/formations?statut=archive");
}

export async function archiveModuleAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      courseId: idSchema,
      moduleId: idSchema
    })
    .parse({
      courseId: formData.get("courseId"),
      moduleId: formData.get("moduleId")
    });

  const result = await db.$transaction(async (tx) => {
    const courseModule = await tx.courseModule.findUnique({
      where: { id: input.moduleId },
      select: {
        id: true,
        courseId: true,
        title: true,
        isRequired: true,
        archivedAt: true,
        course: {
          select: {
            slug: true,
            _count: { select: { enrollments: true } }
          }
        }
      }
    });

    if (!courseModule || courseModule.courseId !== input.courseId) {
      throw new Error("Le module n'appartient pas à cette formation.");
    }

    if (courseModule.archivedAt) {
      return { courseSlug: courseModule.course.slug };
    }

    // Keep the same conservative versioning rule as lesson editing: once a
    // required path has learners, it must remain stable for their history.
    if (courseModule.isRequired && courseModule.course._count.enrollments > 0) {
      throw new Error(
        "Un module obligatoire déjà offert ne peut pas être archivé. Dupliquez la formation pour créer une nouvelle version."
      );
    }

    const archivedAt = new Date();
    await tx.courseModule.update({
      where: { id: courseModule.id },
      data: { archivedAt }
    });
    await tx.adminAuditLog.create({
      data: {
        actorId: actor.id,
        action: "module.archived",
        entityType: "CourseModule",
        entityId: courseModule.id,
        before: { archivedAt: null, title: courseModule.title },
        after: {
          archivedAt: archivedAt.toISOString(),
          courseId: courseModule.courseId,
          title: courseModule.title
        }
      }
    });

    return { courseSlug: courseModule.course.slug };
  });

  revalidateCourseContent(input.courseId, result.courseSlug);
}

export async function archiveLessonAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      courseId: idSchema,
      lessonId: idSchema
    })
    .parse({
      courseId: formData.get("courseId"),
      lessonId: formData.get("lessonId")
    });

  const result = await db.$transaction(async (tx) => {
    const lesson = await tx.lesson.findUnique({
      where: { id: input.lessonId },
      select: {
        id: true,
        title: true,
        isRequired: true,
        archivedAt: true,
        module: {
          select: {
            courseId: true,
            course: {
              select: {
                slug: true,
                _count: { select: { enrollments: true } }
              }
            }
          }
        }
      }
    });

    if (!lesson || lesson.module.courseId !== input.courseId) {
      throw new Error("La leçon n'appartient pas à cette formation.");
    }

    if (lesson.archivedAt) {
      return { courseSlug: lesson.module.course.slug };
    }

    if (lesson.isRequired && lesson.module.course._count.enrollments > 0) {
      throw new Error(
        "Une leçon obligatoire déjà offerte ne peut pas être archivée. Dupliquez la formation pour créer une nouvelle version."
      );
    }

    const archivedAt = new Date();
    await tx.lesson.update({
      where: { id: lesson.id },
      data: { archivedAt }
    });
    await tx.adminAuditLog.create({
      data: {
        actorId: actor.id,
        action: "lesson.archived",
        entityType: "Lesson",
        entityId: lesson.id,
        before: { archivedAt: null, title: lesson.title },
        after: {
          archivedAt: archivedAt.toISOString(),
          courseId: lesson.module.courseId,
          title: lesson.title
        }
      }
    });

    return { courseSlug: lesson.module.course.slug };
  });

  revalidateCourseContent(input.courseId, result.courseSlug);
}

export async function archiveResourceAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      courseId: idSchema,
      resourceId: idSchema
    })
    .parse({
      courseId: formData.get("courseId"),
      resourceId: formData.get("resourceId")
    });

  const result = await db.$transaction(async (tx) => {
    const resource = await tx.courseResource.findUnique({
      where: { id: input.resourceId },
      select: {
        id: true,
        courseId: true,
        title: true,
        archivedAt: true,
        course: { select: { slug: true } }
      }
    });

    if (!resource || resource.courseId !== input.courseId) {
      throw new Error("La ressource n'appartient pas à cette formation.");
    }

    if (resource.archivedAt) {
      return { courseSlug: resource.course.slug };
    }

    const archivedAt = new Date();
    await tx.courseResource.update({
      where: { id: resource.id },
      data: { archivedAt }
    });
    await tx.adminAuditLog.create({
      data: {
        actorId: actor.id,
        action: "resource.archived",
        entityType: "CourseResource",
        entityId: resource.id,
        before: { archivedAt: null, title: resource.title },
        after: {
          archivedAt: archivedAt.toISOString(),
          courseId: resource.courseId,
          title: resource.title
        }
      }
    });

    return { courseSlug: resource.course.slug };
  });

  revalidateCourseContent(input.courseId, result.courseSlug);
}

export async function publishCourseAction(formData: FormData) {
  const actor = await requireAdmin();
  const courseId = idSchema.parse(formData.get("courseId"));
  const course = await db.course.findUniqueOrThrow({
    where: { id: courseId },
    include: {
      modules: {
        where: { archivedAt: null },
        include: {
          lessons: {
            where: { archivedAt: null },
            include: {
              quiz: { include: { questions: { include: { choices: true } } } }
            }
          }
        }
      }
    }
  });
  if (course.slug === "word-documents-professionnels")
    throw new Error(
      "Word reste en préparation jusqu’à validation de son contenu réel."
    );
  if (
    !course.modules.length ||
    !course.modules.some((module) => module.isRequired)
  )
    throw new Error("Ajoutez au moins un module obligatoire.");
  if (
    course.modules.some(
      (module) =>
        module.isRequired &&
        !module.lessons.some(
          (lesson) => lesson.isRequired && lesson.status === "published"
        )
    )
  ) {
    throw new Error(
      "Chaque module obligatoire doit contenir une leçon obligatoire publiée."
    );
  }
  const lessons = course.modules.flatMap((module) => module.lessons);
  if (
    !lessons.length ||
    lessons.some((lesson) => lesson.isRequired && lesson.status !== "published")
  )
    throw new Error("Toutes les leçons obligatoires doivent être publiées.");
  for (const lesson of lessons) lessonContentSchema.parse(lesson.content);
  const quizzes = lessons.map((lesson) => lesson.quiz).filter(Boolean);
  for (const quiz of quizzes) {
    if (
      !quiz ||
      quiz.status !== "published" ||
      !quiz.questions.length ||
      quiz.passingScore < 1 ||
      quiz.passingScore > 100 ||
      (quiz.maxAttempts !== null && quiz.maxAttempts < 1)
    )
      throw new Error("Chaque questionnaire doit être complet et publié.");
    for (const question of quiz.questions)
      if (
        question.choices.length < 2 ||
        question.choices.filter((choice) => choice.isCorrect).length !== 1
      )
        throw new Error(
          "Chaque question doit avoir au moins deux choix et une seule bonne réponse."
        );
  }
  if (
    course.offer === "paid" &&
    (!course.isPurchasable || !course.priceCents || course.priceCents <= 0)
  )
    throw new Error(
      "Une formation payante doit avoir un prix positif et être marquée achetable."
    );
  const updated = await db.course.update({
    where: { id: course.id },
    data: {
      status: "published",
      publishedAt: course.publishedAt ?? new Date(),
      archivedAt: null
    }
  });
  await recordAudit({
    actorId: actor.id,
    action: "course.published",
    entityType: "Course",
    entityId: course.id,
    before: { status: course.status },
    after: { status: updated.status }
  });
  revalidatePath(`/administration/formations/${course.id}`);
  revalidatePath("/formations");
}

export async function duplicateCourseAction(formData: FormData) {
  const actor = await requireAdmin();
  const courseId = idSchema.parse(formData.get("courseId"));
  const original = await db.course.findUniqueOrThrow({
    where: { id: courseId },
    include: {
      modules: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { archivedAt: null },
            orderBy: { position: "asc" },
            include: {
              quiz: {
                include: {
                  questions: {
                    orderBy: { position: "asc" },
                    include: { choices: { orderBy: { position: "asc" } } }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  const suffix = Date.now().toString().slice(-6);
  const copy = await db.$transaction(async (tx) => {
    const created = await tx.course.create({
      data: {
        slug: `${original.slug}-v${original.contentVersion + 1}-${suffix}`.slice(
          0,
          120
        ),
        title: `${original.title} — version suivante`,
        shortTitle:
          `${original.shortTitle} — v${original.contentVersion + 1}`.slice(
            0,
            100
          ),
        description: original.description,
        theme: original.theme,
        level: original.level,
        offer: original.offer,
        priceCents: original.priceCents,
        currency: original.currency,
        durationMinutes: original.durationMinutes,
        durationLabel: original.durationLabel,
        format: original.format,
        audience: original.audience,
        outcomes: original.outcomes as Prisma.InputJsonValue,
        prerequisites: original.prerequisites as Prisma.InputJsonValue,
        status: "draft",
        isPurchasable: false,
        featured: false,
        contentVersion: original.contentVersion + 1
      }
    });
    for (const courseModule of original.modules) {
      const createdModule = await tx.courseModule.create({
        data: {
          courseId: created.id,
          title: courseModule.title,
          description: courseModule.description,
          position: courseModule.position,
          isRequired: courseModule.isRequired
        }
      });
      for (const lesson of courseModule.lessons) {
        const createdLesson = await tx.lesson.create({
          data: {
            moduleId: createdModule.id,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary,
            durationMinutes: lesson.durationMinutes,
            position: lesson.position,
            content: lesson.content as Prisma.InputJsonValue,
            contentVersion: lesson.contentVersion + 1,
            status: "draft",
            isRequired: lesson.isRequired
          }
        });
        if (lesson.quiz)
          await tx.quiz.create({
            data: {
              lessonId: createdLesson.id,
              title: lesson.quiz.title,
              description: lesson.quiz.description,
              passingScore: lesson.quiz.passingScore,
              maxAttempts: lesson.quiz.maxAttempts,
              status: "draft",
              questions: {
                create: lesson.quiz.questions.map((question) => ({
                  prompt: question.prompt,
                  explanation: question.explanation,
                  position: question.position,
                  choices: {
                    create: question.choices.map((choice) => ({
                      label: choice.label,
                      isCorrect: choice.isCorrect,
                      position: choice.position
                    }))
                  }
                }))
              }
            }
          });
      }
    }
    return created;
  });
  await recordAudit({
    actorId: actor.id,
    action: "course.duplicated",
    entityType: "Course",
    entityId: copy.id,
    after: { sourceCourseId: original.id, slug: copy.slug }
  });
  redirect(`/administration/formations/${copy.id}`);
}

export async function addResourceAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      courseId: idSchema,
      lessonId: idSchema.optional(),
      title: text(180),
      description: optionalText(1_000),
      externalUrl: z.string().trim().max(2_000).optional()
    })
    .parse({
      courseId: formData.get("courseId"),
      lessonId: formData.get("lessonId") || undefined,
      title: formData.get("title"),
      description: formData.get("description"),
      externalUrl: formData.get("externalUrl") || undefined
    });
  if (input.lessonId) {
    const lesson = await db.lesson.findFirst({
      where: {
        id: input.lessonId,
        module: { courseId: input.courseId }
      },
      select: { id: true }
    });
    if (!lesson) {
      throw new Error("La leçon n’appartient pas à cette formation.");
    }
  }
  const upload = formData.get("file");
  let resourceData: Prisma.CourseResourceUncheckedCreateInput;
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > MAX_RESOURCE_BYTES)
      throw new Error("Le fichier dépasse 25 Mo.");
    const extension = extname(
      upload.name
    ).toLowerCase() as keyof typeof ALLOWED_RESOURCE_MIME_TYPES;
    const allowed = ALLOWED_RESOURCE_MIME_TYPES[extension];
    if (!allowed || !(allowed as readonly string[]).includes(upload.type))
      throw new Error("Ce type de fichier n’est pas permis.");
    const configuredRoot = process.env.LMS_RESOURCE_ROOT?.trim();
    const root = configuredRoot
      ? resolve(/*turbopackIgnore: true*/ configuredRoot)
      : join(process.cwd(), "data", "lms-resources");
    const storageKey = `${randomUUID()}${extension}`;
    const target = resolve(root, storageKey);
    if (!target.startsWith(`${root}${sep}`))
      throw new Error("Chemin de stockage invalide.");
    const buffer = Buffer.from(await upload.arrayBuffer());
    validateResourceFileContents(buffer, extension as AllowedResourceExtension);
    await mkdir(/*turbopackIgnore: true*/ root, { recursive: true });
    await writeFile(/*turbopackIgnore: true*/ target, buffer);
    resourceData = {
      courseId: input.courseId,
      lessonId: input.lessonId,
      title: input.title,
      description: input.description,
      kind: "file",
      fileName: upload.name.slice(0, 255),
      storageKey,
      mimeType: upload.type,
      sizeBytes: upload.size,
      isProtected: true
    };
  } else {
    const url = getSafeExternalResourceUrl(input.externalUrl ?? null);
    if (!url) {
      throw new Error(
        "Le lien doit être HTTPS, public et sans identifiants intégrés."
      );
    }
    resourceData = {
      courseId: input.courseId,
      lessonId: input.lessonId,
      title: input.title,
      description: input.description,
      kind: "link",
      externalUrl: url,
      isProtected: true
    };
  }
  const resource = await db.courseResource.create({ data: resourceData });
  await recordAudit({
    actorId: actor.id,
    action: "resource.created",
    entityType: "CourseResource",
    entityId: resource.id,
    after: {
      courseId: resource.courseId,
      title: resource.title,
      kind: resource.kind
    }
  });
  revalidatePath(`/administration/formations/${input.courseId}`);
}

export async function manualEnrollmentAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      courseId: idSchema,
      email: z.string().trim().toLowerCase().email().max(254)
    })
    .parse({
      courseId: formData.get("courseId"),
      email: formData.get("email")
    });
  const [user, course] = await Promise.all([
    db.user.findUnique({ where: { email: input.email } }),
    db.course.findFirst({
      where: {
        id: input.courseId,
        status: "published",
        archivedAt: null
      },
      select: { id: true }
    })
  ]);
  if (!user?.isActive || !user.emailVerified)
    throw new Error("Un compte actif avec courriel vérifié est requis.");
  if (!course) throw new Error("La formation doit être publiée et active.");
  const enrollment = await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: input.courseId } },
    create: { userId: user.id, courseId: input.courseId, source: "manual" },
    update: { status: "active", source: "manual", revokedAt: null }
  });
  await recordAudit({
    actorId: actor.id,
    action: "enrollment.manually_granted",
    entityType: "Enrollment",
    entityId: enrollment.id,
    after: { userId: user.id, courseId: input.courseId }
  });
  revalidatePath("/administration/inscriptions");
}

export async function revokeEnrollmentAction(formData: FormData) {
  const actor = await requireAdmin();
  const enrollmentId = idSchema.parse(formData.get("enrollmentId"));
  await db.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findUniqueOrThrow({
      where: { id: enrollmentId }
    });
    const revokedAt = new Date();
    const updated = await tx.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "revoked", revokedAt }
    });
    await tx.certificate.updateMany({
      where: { enrollmentId: enrollment.id, revokedAt: null },
      data: { revokedAt }
    });
    await tx.adminAuditLog.create({
      data: {
        actorId: actor.id,
        action: "enrollment.revoked",
        entityType: "Enrollment",
        entityId: enrollment.id,
        before: { status: enrollment.status, revokedAt: enrollment.revokedAt },
        after: { status: updated.status, revokedAt: updated.revokedAt }
      }
    });
  });
  revalidatePath("/administration/inscriptions");
}

export async function updateUserAccessAction(formData: FormData) {
  const actor = await requireAdmin();
  const input = z
    .object({
      userId: idSchema,
      role: z.enum(["learner", "admin"]),
      isActive: z.boolean()
    })
    .parse({
      userId: formData.get("userId"),
      role: formData.get("role"),
      isActive: formData.get("isActive") === "on"
    });
  await db.$transaction(async (tx) => {
    const currentActor = await tx.user.findUnique({ where: { id: actor.id } });
    if (!currentActor?.isActive || currentActor.role !== "admin") {
      throw new Error("Les droits administrateur ne sont plus actifs.");
    }
    const target = await tx.user.findUniqueOrThrow({
      where: { id: input.userId }
    });
    if (
      target.role === "admin" &&
      target.isActive &&
      (input.role !== "admin" || !input.isActive)
    ) {
      const activeAdmins = await tx.user.count({
        where: { role: "admin", isActive: true }
      });
      if (activeAdmins <= 1)
        throw new Error(
          "Le dernier administrateur actif ne peut pas être rétrogradé ou désactivé."
        );
    }
    const updated = await tx.user.update({
      where: { id: target.id },
      data: { role: input.role, isActive: input.isActive }
    });
    await tx.adminAuditLog.create({
      data: {
        actorId: actor.id,
        action: "user.access_updated",
        entityType: "User",
        entityId: target.id,
        before: { role: target.role, isActive: target.isActive },
        after: { role: updated.role, isActive: updated.isActive }
      }
    });
  });
  revalidatePath("/administration/utilisateurs");
}
