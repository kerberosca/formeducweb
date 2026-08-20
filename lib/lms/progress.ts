import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { issueCertificateIfEligible } from "@/lib/lms/certificates";
import {
  findCourseForActiveLearner,
  requireActiveEnrollment,
  type CourseLocator
} from "@/lib/lms/enrollments";
import { LmsError } from "@/lib/lms/errors";

const LEGACY_IMPORT_ACTION = "lms.legacy_progress_imported";

export type ProgressUpdate = CourseLocator & {
  lessonId: string;
  status: "in_progress" | "completed";
  lastPosition: number;
};

export type LegacyProgressItem = {
  lessonId?: string;
  lessonSlug?: string;
  completed: boolean;
  lastPosition: number;
};

export async function recalculateEnrollmentProgress(
  client: Prisma.TransactionClient,
  enrollmentId: string
) {
  const enrollment = await client.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, courseId: true, completedAt: true }
  });

  if (!enrollment) {
    throw new LmsError(
      404,
      "L’inscription est introuvable.",
      "enrollment_not_found"
    );
  }

  const requiredLessonWhere = {
    isRequired: true,
    status: "published",
    archivedAt: null,
    module: {
      courseId: enrollment.courseId,
      isRequired: true,
      archivedAt: null
    }
  } satisfies Prisma.LessonWhereInput;

  const [requiredLessons, completedLessons] = await Promise.all([
    client.lesson.count({ where: requiredLessonWhere }),
    client.lessonProgress.count({
      where: {
        enrollmentId,
        status: "completed",
        lesson: requiredLessonWhere
      }
    })
  ]);

  const progressPercent =
    requiredLessons === 0
      ? 0
      : Math.min(100, Math.floor((completedLessons * 100) / requiredLessons));

  return client.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPercent,
      ...(progressPercent === 100 && !enrollment.completedAt
        ? { completedAt: new Date() }
        : {})
    }
  });
}

async function requireCourseLesson(
  client: Prisma.TransactionClient,
  courseId: string,
  lessonId: string
) {
  const lesson = await client.lesson.findFirst({
    where: {
      id: lessonId,
      status: "published",
      archivedAt: null,
      module: { courseId, archivedAt: null }
    }
  });

  if (!lesson) {
    throw new LmsError(404, "La leçon est introuvable.", "lesson_not_found");
  }
  return lesson;
}

export async function updateLessonProgress(
  userId: string,
  input: ProgressUpdate
) {
  const course = await findCourseForActiveLearner(userId, input);
  const enrollment = await requireActiveEnrollment(userId, course.id);

  const updatedEnrollment = await db.$transaction(async (transaction) => {
    await requireCourseLesson(transaction, course.id, input.lessonId);
    const current = await transaction.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: input.lessonId
        }
      }
    });
    const isAlreadyCompleted = current?.status === "completed";
    const status = isAlreadyCompleted ? "completed" : input.status;

    await transaction.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: input.lessonId
        }
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: input.lessonId,
        status,
        lastPosition: input.lastPosition,
        completedAt: status === "completed" ? new Date() : null
      },
      update: {
        status,
        lastPosition: Math.max(current?.lastPosition ?? 0, input.lastPosition),
        ...(status === "completed" && !current?.completedAt
          ? { completedAt: new Date() }
          : {})
      }
    });

    await transaction.enrollment.update({
      where: { id: enrollment.id },
      data: { lastLessonId: input.lessonId }
    });

    return recalculateEnrollmentProgress(transaction, enrollment.id);
  });

  if (updatedEnrollment.progressPercent === 100) {
    await issueCertificateIfEligible(userId, enrollment.id);
  }
  return updatedEnrollment;
}

export async function importLegacyProgress(
  userId: string,
  locator: CourseLocator,
  items: LegacyProgressItem[],
  confirmed: true
) {
  if (confirmed !== true) {
    throw new LmsError(
      400,
      "L’import de l’ancienne progression doit être confirmé.",
      "legacy_import_confirmation_required"
    );
  }
  const course = await findCourseForActiveLearner(userId, locator);
  const enrollment = await requireActiveEnrollment(userId, course.id);

  const existingMarker = await db.adminAuditLog.findFirst({
    where: {
      actorId: userId,
      action: LEGACY_IMPORT_ACTION,
      entityType: "Enrollment",
      entityId: enrollment.id
    },
    select: { id: true, createdAt: true }
  });
  if (existingMarker) {
    return {
      enrollment,
      alreadyImported: true,
      importedAt: existingMarker.createdAt
    };
  }

  const lessons = await db.lesson.findMany({
    where: {
      status: "published",
      archivedAt: null,
      module: { courseId: course.id, archivedAt: null }
    },
    select: { id: true, slug: true }
  });
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const bySlug = new Map<string, (typeof lessons)[number][]>();
  for (const lesson of lessons) {
    bySlug.set(lesson.slug, [...(bySlug.get(lesson.slug) ?? []), lesson]);
  }

  const resolved = items.map((item) => {
    const candidates = item.lessonId
      ? [byId.get(item.lessonId)].filter(Boolean)
      : (bySlug.get(item.lessonSlug!) ?? []);
    if (candidates.length !== 1) {
      throw new LmsError(
        400,
        "Une leçon de l’ancienne progression est inconnue ou ambiguë.",
        "invalid_legacy_lesson"
      );
    }
    return { ...item, lessonId: candidates[0]!.id };
  });

  const result = await db.$transaction(async (transaction) => {
    const marker = await transaction.adminAuditLog.findFirst({
      where: {
        actorId: userId,
        action: LEGACY_IMPORT_ACTION,
        entityType: "Enrollment",
        entityId: enrollment.id
      },
      select: { createdAt: true }
    });
    if (marker) {
      return {
        enrollment,
        alreadyImported: true,
        importedAt: marker.createdAt
      };
    }

    for (const item of resolved) {
      const current = await transaction.lessonProgress.findUnique({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId: item.lessonId
          }
        }
      });
      const completed = item.completed || current?.status === "completed";
      await transaction.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId: item.lessonId
          }
        },
        create: {
          enrollmentId: enrollment.id,
          lessonId: item.lessonId,
          status: completed ? "completed" : "in_progress",
          lastPosition: item.lastPosition,
          completedAt: completed ? new Date() : null
        },
        update: {
          status: completed ? "completed" : "in_progress",
          lastPosition: Math.max(current?.lastPosition ?? 0, item.lastPosition),
          ...(completed && !current?.completedAt
            ? { completedAt: new Date() }
            : {})
        }
      });
    }

    const importMarker = await transaction.adminAuditLog.create({
      data: {
        actorId: userId,
        action: LEGACY_IMPORT_ACTION,
        entityType: "Enrollment",
        entityId: enrollment.id,
        after: { itemCount: resolved.length, source: "localStorage" }
      }
    });

    const updatedEnrollment = await recalculateEnrollmentProgress(
      transaction,
      enrollment.id
    );
    return {
      enrollment: updatedEnrollment,
      alreadyImported: false,
      importedAt: importMarker.createdAt
    };
  });

  if (result.enrollment.progressPercent === 100) {
    await issueCertificateIfEligible(userId, enrollment.id);
  }
  return result;
}

export async function getCourseProgress(
  userId: string,
  locator: CourseLocator
) {
  const course = await findCourseForActiveLearner(userId, locator);
  const enrollment = await requireActiveEnrollment(userId, course.id);
  const progress = await db.lessonProgress.findMany({
    where: { enrollmentId: enrollment.id },
    orderBy: { lesson: { position: "asc" } },
    select: {
      lessonId: true,
      status: true,
      lastPosition: true,
      startedAt: true,
      completedAt: true,
      updatedAt: true
    }
  });
  return { enrollment, progress };
}
