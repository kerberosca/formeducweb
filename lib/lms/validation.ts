import { z } from "zod";

import {
  COURSE_FORMATS,
  COURSE_LEVELS,
  LESSON_PROGRESS_STATUSES
} from "@/lib/lms/constants";

const containsHtml = /<\/?[a-z][^>]*>/i;

export const plainTextSchema = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLength)
    .refine((value) => !containsHtml.test(value), {
      message: "Le HTML n’est pas permis."
    });

const optionalPlainText = (maxLength: number) =>
  plainTextSchema(maxLength).optional();

const titleBlockSchema = z
  .object({
    type: z.literal("title"),
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(2),
    text: plainTextSchema(180)
  })
  .strict();

const paragraphBlockSchema = z
  .object({
    type: z.literal("paragraph"),
    text: plainTextSchema(5_000)
  })
  .strict();

const listBlockSchema = z
  .object({
    type: z.literal("list"),
    style: z.enum(["bullet", "numbered"]).default("bullet"),
    items: z.array(plainTextSchema(1_000)).min(1).max(30)
  })
  .strict();

const calloutBlockSchema = z
  .object({
    type: z.literal("callout"),
    tone: z.enum(["info", "success", "warning"]).default("info"),
    title: optionalPlainText(160),
    text: plainTextSchema(2_000)
  })
  .strict();

const stepsBlockSchema = z
  .object({
    type: z.literal("steps"),
    items: z
      .array(
        z
          .object({
            title: plainTextSchema(180),
            text: optionalPlainText(1_500)
          })
          .strict()
      )
      .min(1)
      .max(20)
  })
  .strict();

const imageSourceSchema = z
  .string()
  .trim()
  .max(2_000)
  .refine(
    (value) => {
      if (value.startsWith("/")) return !value.startsWith("//");
      try {
        const url = new URL(value);
        return url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "L’image doit utiliser un chemin local ou une URL HTTPS." }
  );

const imageBlockSchema = z
  .object({
    type: z.literal("image"),
    src: imageSourceSchema,
    alt: plainTextSchema(300),
    caption: optionalPlainText(500)
  })
  .strict();

const safeLinkSchema = z
  .string()
  .trim()
  .max(2_000)
  .refine(
    (value) => {
      if (value.startsWith("/")) return !value.startsWith("//");
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "mailto:";
      } catch {
        return false;
      }
    },
    { message: "Le lien doit être local, HTTPS ou courriel." }
  );

const linkBlockSchema = z
  .object({
    type: z.literal("link"),
    href: safeLinkSchema,
    label: plainTextSchema(180),
    description: optionalPlainText(800)
  })
  .strict();

const exerciseBlockSchema = z
  .object({
    type: z.literal("exercise"),
    title: plainTextSchema(180),
    instructions: plainTextSchema(3_000),
    successCriteria: z.array(plainTextSchema(500)).max(20).default([])
  })
  .strict();

export const lessonBlockSchema = z.discriminatedUnion("type", [
  titleBlockSchema,
  paragraphBlockSchema,
  listBlockSchema,
  calloutBlockSchema,
  stepsBlockSchema,
  imageBlockSchema,
  linkBlockSchema,
  exerciseBlockSchema
]);

export const lessonContentSchema = z
  .object({
    version: z.literal(1),
    blocks: z.array(lessonBlockSchema).min(1).max(200)
  })
  .strict();

export type LessonContent = z.infer<typeof lessonContentSchema>;

export const courseLevelSchema = z.enum(COURSE_LEVELS);
export const courseFormatSchema = z.enum(COURSE_FORMATS);

const courseLocatorShape = {
  courseId: z.string().cuid().optional(),
  courseSlug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
};

const requireOneCourseLocator = (
  value: { courseId?: string; courseSlug?: string },
  context: z.RefinementCtx
) => {
  if (Boolean(value.courseId) === Boolean(value.courseSlug)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Fournissez soit courseId, soit courseSlug.",
      path: ["courseId"]
    });
  }
};

export const enrollmentRequestSchema = z
  .object(courseLocatorShape)
  .strict()
  .superRefine(requireOneCourseLocator);

const progressUpdateObjectSchema = z
  .object({
    ...courseLocatorShape,
    lessonId: z.string().cuid(),
    status: z.enum(LESSON_PROGRESS_STATUSES),
    lastPosition: z.number().int().min(0).max(10_000_000).default(0)
  })
  .strict();

export const progressUpdateSchema = progressUpdateObjectSchema.superRefine(
  requireOneCourseLocator
);

const legacyProgressItemSchema = z
  .object({
    lessonId: z.string().cuid().optional(),
    lessonSlug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    completed: z.boolean(),
    lastPosition: z.number().int().min(0).max(10_000_000).default(0)
  })
  .strict()
  .superRefine((value, context) => {
    if (Boolean(value.lessonId) === Boolean(value.lessonSlug)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fournissez soit lessonId, soit lessonSlug.",
        path: ["lessonId"]
      });
    }
  });

const legacyProgressImportObjectSchema = z
  .object({
    ...courseLocatorShape,
    confirmed: z.literal(true),
    items: z.array(legacyProgressItemSchema).min(1).max(500)
  })
  .strict();

export const legacyProgressImportSchema =
  legacyProgressImportObjectSchema.superRefine(requireOneCourseLocator);

export const progressRequestSchema = z
  .discriminatedUnion("operation", [
    progressUpdateObjectSchema.extend({ operation: z.literal("update") }),
    legacyProgressImportObjectSchema.extend({
      operation: z.literal("import_legacy")
    })
  ])
  .superRefine(requireOneCourseLocator);

export const quizLocatorSchema = z
  .object({
    quizId: z.string().cuid().optional(),
    lessonId: z.string().cuid().optional()
  })
  .strict()
  .superRefine((value, context) => {
    if (Boolean(value.quizId) === Boolean(value.lessonId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fournissez soit quizId, soit lessonId."
      });
    }
  });

export const quizSubmissionSchema = z
  .object({
    quizId: z.string().cuid(),
    answers: z
      .array(
        z
          .object({
            questionId: z.string().cuid(),
            choiceId: z.string().cuid()
          })
          .strict()
      )
      .min(1)
      .max(200)
  })
  .strict()
  .superRefine((value, context) => {
    const questionIds = value.answers.map((answer) => answer.questionId);
    if (new Set(questionIds).size !== questionIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Une seule réponse est permise par question.",
        path: ["answers"]
      });
    }
  });
