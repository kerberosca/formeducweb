import "server-only";

import type { Prisma } from "@prisma/client";

import type {
  PublicCourseDetail,
  PublicCourseSummary
} from "@/components/lms/types";
import { db } from "@/lib/db";
import { lessonContentSchema } from "@/lib/lms/validation";
import { findCourseForActiveLearner } from "@/lib/lms/enrollments";

function strings(value: Prisma.JsonValue): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function formatPrice(
  offer: string,
  priceCents: number | null,
  currency: string,
  status: string
) {
  if (status === "preparation") {
    if (priceCents === null) return "En préparation";
    const price = new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0
    }).format(priceCents / 100);
    return `${price} · en préparation`;
  }
  if (offer === "free" || priceCents === 0) return "Gratuite";
  if (offer === "custom" || priceCents === null) return "Sur devis";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0
  }).format(priceCents / 100);
}

const publicCourseInclude = {
  modules: {
    where: { archivedAt: null },
    orderBy: { position: "asc" },
    include: {
      lessons: {
        where: { archivedAt: null, status: "published" },
        orderBy: { position: "asc" },
        include: {
          resources: {
            where: { archivedAt: null },
            orderBy: { createdAt: "asc" }
          },
          quiz: {
            include: {
              questions: {
                orderBy: { position: "asc" },
                include: {
                  choices: {
                    orderBy: { position: "asc" },
                    select: { id: true, label: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.CourseInclude;

type CourseWithContent = Prisma.CourseGetPayload<{
  include: typeof publicCourseInclude;
}>;

function toSummary(
  course: Pick<
    CourseWithContent,
    | "id"
    | "slug"
    | "title"
    | "shortTitle"
    | "description"
    | "theme"
    | "level"
    | "offer"
    | "priceCents"
    | "currency"
    | "durationMinutes"
    | "durationLabel"
    | "format"
    | "audience"
    | "outcomes"
    | "prerequisites"
    | "status"
    | "isPurchasable"
    | "featured"
  > & { modules: { lessons: unknown[] }[] }
): PublicCourseSummary {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortTitle: course.shortTitle,
    description: course.description,
    theme: course.theme,
    level: course.level,
    offer: course.offer,
    priceCents: course.priceCents,
    currency: course.currency,
    priceLabel: formatPrice(
      course.offer,
      course.priceCents,
      course.currency,
      course.status
    ),
    durationMinutes: course.durationMinutes,
    durationLabel: course.durationLabel,
    format: course.format,
    audience: course.audience,
    outcomes: strings(course.outcomes),
    prerequisites: strings(course.prerequisites),
    status: course.status,
    isPurchasable: course.isPurchasable,
    featured: course.featured,
    lessonCount: course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    )
  };
}

function toDetail(course: CourseWithContent): PublicCourseDetail {
  return {
    ...toSummary(course),
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      position: module.position,
      lessons: module.lessons.map((lesson) => {
        const parsedContent = lessonContentSchema.safeParse(lesson.content);
        return {
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          durationMinutes: lesson.durationMinutes,
          position: lesson.position,
          isRequired: lesson.isRequired,
          content: parsedContent.success
            ? parsedContent.data
            : {
                version: 1 as const,
                blocks: [{ type: "paragraph" as const, text: lesson.summary }]
              },
          quiz:
            lesson.quiz?.status === "published"
              ? {
                  id: lesson.quiz.id,
                  title: lesson.quiz.title,
                  description: lesson.quiz.description,
                  passingScore: lesson.quiz.passingScore,
                  maxAttempts: lesson.quiz.maxAttempts,
                  attemptCount: 0,
                  questions: lesson.quiz.questions.map((question) => ({
                    id: question.id,
                    prompt: question.prompt,
                    choices: question.choices
                  }))
                }
              : null,
          resources: lesson.resources.map((resource) => ({
            id: resource.id,
            title: resource.title,
            description: resource.description,
            kind: resource.kind,
            fileName: resource.fileName
          }))
        };
      })
    }))
  };
}

export async function listPublicCourses(): Promise<PublicCourseSummary[]> {
  const records = await db.course.findMany({
    where: {
      status: { in: ["published", "preparation"] },
      archivedAt: null
    },
    orderBy: [{ featured: "desc" }, { title: "asc" }],
    include: publicCourseInclude
  });
  return records.map(toSummary);
}

export async function getPublicCourse(
  slug: string
): Promise<PublicCourseDetail | null> {
  const course = await db.course.findFirst({
    where: {
      slug,
      status: { in: ["published", "preparation"] },
      archivedAt: null
    },
    include: publicCourseInclude
  });
  return course ? toDetail(course) : null;
}

export async function getLearningCourseForUser(
  userId: string,
  slug: string
): Promise<PublicCourseDetail> {
  const authorizedCourse = await findCourseForActiveLearner(userId, {
    courseSlug: slug
  });
  const course = await db.course.findUniqueOrThrow({
    where: { id: authorizedCourse.id },
    include: publicCourseInclude
  });
  return toDetail(course);
}
