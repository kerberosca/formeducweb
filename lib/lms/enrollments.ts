import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { LmsError } from "@/lib/lms/errors";

export type CourseLocator = {
  courseId?: string;
  courseSlug?: string;
};

function assertCourseLocator(locator: CourseLocator) {
  if (Boolean(locator.courseId) === Boolean(locator.courseSlug)) {
    throw new LmsError(
      400,
      "Fournissez un seul identifiant de formation.",
      "invalid_course_locator"
    );
  }
}

export async function findPublishedCourse(
  locator: CourseLocator,
  client: Prisma.TransactionClient | typeof db = db
) {
  assertCourseLocator(locator);
  const course = await client.course.findFirst({
    where: {
      ...(locator.courseId ? { id: locator.courseId } : {}),
      ...(locator.courseSlug ? { slug: locator.courseSlug } : {}),
      status: "published",
      archivedAt: null
    }
  });

  if (!course) {
    throw new LmsError(
      404,
      "La formation est introuvable.",
      "course_not_found"
    );
  }

  return course;
}

/**
 * Archived courses disappear from the catalogue and reject new enrollments,
 * but remain learnable by users whose enrollment is still active.
 */
export async function findCourseForActiveLearner(
  userId: string,
  locator: CourseLocator,
  client: Prisma.TransactionClient | typeof db = db
) {
  assertCourseLocator(locator);
  const course = await client.course.findFirst({
    where: {
      ...(locator.courseId ? { id: locator.courseId } : {}),
      ...(locator.courseSlug ? { slug: locator.courseSlug } : {}),
      enrollments: {
        some: { userId, status: "active", revokedAt: null }
      }
    }
  });

  if (!course) {
    throw new LmsError(
      404,
      "La formation est introuvable.",
      "course_not_found"
    );
  }
  return course;
}

export async function requireActiveEnrollment(
  userId: string,
  courseId: string,
  client: Prisma.TransactionClient | typeof db = db
) {
  const enrollment = await client.enrollment.findFirst({
    where: {
      userId,
      courseId,
      status: "active",
      revokedAt: null
    }
  });

  if (!enrollment) {
    throw new LmsError(
      403,
      "Une inscription active est requise pour cette formation.",
      "active_enrollment_required"
    );
  }

  return enrollment;
}

export async function enrollUserInCourse(
  userId: string,
  locator: CourseLocator
) {
  const course = await findPublishedCourse(locator);
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    include: { course: true }
  });

  if (existing) {
    if (existing.status !== "active" || existing.revokedAt) {
      throw new LmsError(
        403,
        "L’accès à cette formation a été révoqué.",
        "enrollment_revoked"
      );
    }
    return existing;
  }

  const isFree = course.offer === "free" && (course.priceCents ?? 0) === 0;
  let source = "free";

  if (!isFree) {
    const entitlement = await db.entitlement.findFirst({
      where: {
        userId,
        courseId: course.id,
        resourceType: "course",
        status: "active",
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      select: { id: true }
    });

    if (!entitlement) {
      throw new LmsError(
        403,
        "Cette formation doit être achetée avant l’inscription.",
        "course_purchase_required"
      );
    }
    source = "purchase";
  }

  try {
    return await db.enrollment.create({
      data: { userId, courseId: course.id, source },
      include: { course: true }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
        include: { course: true }
      });
      if (enrollment?.status === "active" && !enrollment.revokedAt) {
        return enrollment;
      }
    }
    throw error;
  }
}

export async function listUserEnrollments(userId: string) {
  return db.enrollment.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          shortTitle: true,
          description: true,
          durationLabel: true,
          theme: true,
          status: true
        }
      },
      certificate: {
        select: {
          id: true,
          token: true,
          issuedAt: true,
          revokedAt: true
        }
      }
    }
  });
}
